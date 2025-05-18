import { Request, Response, NextFunction } from "express";
import appUser from "../models/appuser";
import PickupPerson from "../models/pickupPerson";
import QueueEntry from "../models/queue";
import { io } from "../socket";

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
  
      return res.status(201).json({ message: `Successfully joined the queue at position ${newQueueNumber}` });
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

    const queueEntry = await QueueEntry.findOne({
      pickupPersonId: pickupPerson.id,
      pickedUp: false, // only active queue entries
    });
    if (!queueEntry) {
      throw new Error("You are not in the queue.");
    }

    const removedRank = queueEntry.queueNumber;

    // Instead of deleting, mark as picked up (soft delete)
    queueEntry.pickedUp = true;
    await queueEntry.save();

    delete liveLocations[pickupPerson.id];

    // Reorder queue numbers for everyone after this person
    await QueueEntry.updateMany(
      { queueNumber: { $gt: removedRank }, pickedUp: false },
      { $inc: { queueNumber: -1 } }
    );

    io.emit("queueUpdated");

    return { message: "Pickup completed successfully" };
  } catch (error) {
    console.error("Pickup complete error:", error);
    throw error;
  }
};
