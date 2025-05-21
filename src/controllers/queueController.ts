import { Request, Response, NextFunction } from "express";
import appUser from "../models/appuser";
import PickupPerson from "../models/pickupPerson";
import QueueEntry from "../models/queue";
import { io } from "../socket";
import { getPickupPersonById } from "./pickupPerson.controller";

interface AuthRequest extends Request {
  user?: any;
}

// Temporary in-memory location store
const liveLocations: {
  [pickupPersonId: number]: { latitude: number; longitude: number };
} = {};

// Join Queue
export const autoJoinQueue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { latitude, longitude } = req.body;
      const userEmail = req.user?.email;
  
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized: no user info" });
      }
  
      const user = await appUser.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: "App user not found" });
      }
  
      const pickupPerson = await PickupPerson.findOne({ email: userEmail }).select("id name");
      if (!pickupPerson) {
        return res.status(404).json({ message: "Pickup person not found" });
      }
  
      const alreadyQueued = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
      if (alreadyQueued) {
        return res.status(409).json({ message: "You are already in the queue." });
      }
  
      const queue = await QueueEntry.find().sort({ queueNumber: -1 }).limit(1);
      const newQueueNumber = queue.length > 0 ? queue[0].queueNumber + 1 : 1;
  
      const newEntry = new QueueEntry({
        pickupPersonId: pickupPerson.id,
        queueNumber: newQueueNumber,
        joinedAt: new Date(),
        pickedUp: false,
      });
  
      await newEntry.save();
  
      // Optionally save live location if you use it
      // liveLocations[pickupPerson.id] = { latitude, longitude };
  
      io.emit("queueUpdated");
  
      return res.status(201).json({ message: `Successfully joined the queue at position ${newQueueNumber}`, pickupPersonById: pickupPerson.id.toString()});
    } catch (error) {
      console.error("Join queue error:", error);
      next(error);
    }
  };

// Get Queue Ranks (only active entries)
export const getQueueRanks = async (req: Request, res: Response) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized: no user info" });
      }
  
      const user = await appUser.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: "App user not found" });
      }
  
      const entries = await QueueEntry.find().sort({ queueNumber: 1 });
  
      const results = entries.map((entry) => ({
        pickupPersonId: entry.pickupPersonId,
        queueNumber: entry.queueNumber,
        location: liveLocations[entry.pickupPersonId] || null,
      }));
  
      console.log(`Returning ${results.length} queue entries with locations`);
      return res.json(results);  // <---- THIS IS CRUCIAL
    } catch (error) {
      console.error("Get queue ranks error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  

// Pickup Complete
export const pickupComplete = async (req: AuthRequest): Promise<{ message: string }> => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        throw new Error("Unauthorized: no user info");
      }
  
      const user = await appUser.findOne({ email: userEmail });
      if (!user) {
        throw new Error("App user not found");
      }
  
      const pickupPerson = await PickupPerson.findOne({ email: userEmail }).select("id");
      if (!pickupPerson) {
        throw new Error("Pickup person not found");
      }
  
      // Find the earliest queue entry for this pickupPersonId
      const queueEntries = await QueueEntry.find({ pickupPersonId: pickupPerson.id }).sort({ joinedAt: 1 });
  
      if (!queueEntries.length) {
        throw new Error("You are not in the queue.");
      }
  
      // Delete duplicates if any, keep only the earliest
      const [earliestEntry, ...duplicates] = queueEntries;
      if (duplicates.length > 0) {
        const duplicateIds = duplicates.map(entry => entry._id);
        await QueueEntry.deleteMany({ _id: { $in: duplicateIds } });
        console.log(`Deleted ${duplicateIds.length} duplicate queue entries for pickupPersonId ${pickupPerson.id}`);
      }
  
      // Store the removed queue number before deletion
      const removedRank = earliestEntry.queueNumber;
  
      // Remove this entry from queue (user leaving or pickup completed)
      await earliestEntry.deleteOne();
  
      // Remove live location if stored
      delete liveLocations[pickupPerson.id];
  
      // Decrement queue numbers of everyone behind the removed entry
      await QueueEntry.updateMany(
        { queueNumber: { $gt: removedRank } },
        { $inc: { queueNumber: -1 } }
      );
  
      // Notify all clients to update queue display
      io.emit("queueUpdated");
  
      return { message: "You have successfully left the queue" };
    } catch (error) {
      console.error("Pickup complete / leave queue error:", error);
      throw error;
    }
  };
  
