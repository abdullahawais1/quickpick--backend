import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import appUser from "../models/appuser";
import PickupPerson from "../models/pickupPerson";
import QueueEntry from "../models/queue";
import { io } from "../socket";

interface AuthRequest extends Request {
  user?: any;
}

const liveLocations: {
  [pickupPersonId: number]: { latitude: number; longitude: number };
} = {};

// Join Queue with transaction and return pickupPersonId and queueNumber
export const autoJoinQueue = async (
  req: AuthRequest,
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const queue = await QueueEntry.find().sort({ queueNumber: -1 }).limit(1).session(session);
      const newQueueNumber = queue.length > 0 ? queue[0].queueNumber + 1 : 1;

      const newEntry = new QueueEntry({
        pickupPersonId: pickupPerson.id,
        queueNumber: newQueueNumber,
        joinedAt: new Date(),
        pickedUp: false,
      });

      await newEntry.save({ session });

      await session.commitTransaction();
      session.endSession();


      io.emit("queueUpdated");

      return res.status(201).json({
        message: `Successfully joined the queue at position ${newQueueNumber}`,
        pickupPersonId: pickupPerson.id,
        queueNumber: newQueueNumber,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Join queue error:", error);
    next(error);
  }
};

// Get Queue Ranks (active entries only)
export const getQueueRanks = async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const user = await appUser.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "App user not found" });
    }

    // Only active (not picked up) queue entries
    const entries = await QueueEntry.find({ pickedUp: false }).sort({ queueNumber: 1 });

    // Add live location if available
    const results = entries.map((entry) => ({
      pickupPersonId: entry.pickupPersonId,
      queueNumber: entry.queueNumber,
      location: liveLocations[entry.pickupPersonId] || null,
    }));

    console.log(`Returning ${results.length} queue entries with locations`);
    return res.json(results);
  } catch (error) {
    console.error("Get queue ranks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Pickup Complete or Leave Queue
export const pickupCompleteHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const user = await appUser.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "App user not found" });
    }

    const pickupPerson = await PickupPerson.findOne({ email: userEmail }).select("id");
    if (!pickupPerson) {
      return res.status(404).json({ message: "Pickup person not found" });
    }

    const queueEntries = await QueueEntry.find({ pickupPersonId: pickupPerson.id }).sort({ joinedAt: 1 });

    if (!queueEntries.length) {
      return res.status(400).json({ message: "You are not in the queue." });
    }

    const [earliestEntry, ...duplicates] = queueEntries;

    if (duplicates.length > 0) {
      const duplicateIds = duplicates.map((entry) => entry._id);
      await QueueEntry.deleteMany({ _id: { $in: duplicateIds } });
      console.log(`Deleted ${duplicateIds.length} duplicate queue entries for pickupPersonId ${pickupPerson.id}`);
    }

    const removedRank = earliestEntry.queueNumber;
    await earliestEntry.deleteOne();

    delete liveLocations[pickupPerson.id];

    // Decrement queue numbers of everyone behind the removed entry
    await QueueEntry.updateMany(
      { queueNumber: { $gt: removedRank } },
      { $inc: { queueNumber: -1 } }
    );

    io.emit("queueUpdated");

    return res.json({ message: "You have successfully left the queue" });
  } catch (error) {
    console.error("Pickup complete / leave queue error:", error);
    next(error);
  }
};
