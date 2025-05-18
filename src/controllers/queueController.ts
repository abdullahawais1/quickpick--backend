import { Request } from "express";
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
export const autoJoinQueue = async (req: AuthRequest): Promise<{ message: string }> => {
    console.log("autoJoinQueue user email:", req.user?.email);
    try {
      const { latitude, longitude } = req.body;
      console.log("Received latitude:", latitude, "longitude:", longitude);
  
      const userEmail = req.user?.email;
  
      if (!userEmail) {
        throw new Error("Unauthorized: no user info");
      }
  
      const user = await appUser.findOne({ email: userEmail });
      console.log("Found appUser:", user ? "yes" : "no");
      if (!user) {
        throw new Error("App user not found");
      }
  
      const pickupPerson = await PickupPerson.findOne({ email: userEmail }).select("id name");
      console.log("Found pickupPerson:", pickupPerson ? `yes (id=${pickupPerson.id})` : "no");
      if (!pickupPerson) {
        throw new Error("Pickup person not found");
      }
  
      const alreadyQueued = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
      console.log("Already queued:", alreadyQueued ? "yes" : "no");
      if (alreadyQueued) {
        return { message: "You are already in the queue." };
      }
  
      const queue = await QueueEntry.find().sort({ queueNumber: -1 }).limit(1);
      console.log("Current highest queue number entry:", queue.length ? queue[0].queueNumber : "none");
  
      const newQueueNumber = queue.length > 0 ? queue[0].queueNumber + 1 : 1;
  
      const newEntry = new QueueEntry({
        pickupPersonId: pickupPerson.id,
        queueNumber: newQueueNumber,
        joinedAt: new Date(),
        pickedUp: false,
      });
  
      await newEntry.save();
      console.log("New queue entry saved:", newEntry);
  
      liveLocations[pickupPerson.id] = { latitude, longitude };
  
      io.emit("queueUpdated");
  
      return { message: `Successfully joined the queue at position ${newQueueNumber}` };
    } catch (error) {
      console.error("Join queue error:", error);
      throw error;
    }
  };
  

// Get Queue Ranks (only active entries)
export const getQueueRanks = async (
  req: AuthRequest
): Promise<
  { pickupPersonId: number; queueNumber: number; location: { latitude: number; longitude: number } | null }[]
> => {
  try {
    const userEmail = req.user?.email;
    console.log("getQueueRanks called with user email:", userEmail);

    if (!userEmail) {
      throw new Error("Unauthorized: no user info");
    }

    const user = await appUser.findOne({ email: userEmail });
    console.log("Found appUser:", user ? "yes" : "no");
    if (!user) {
      throw new Error("App user not found");
    }

    // Fetch only active queue entries (pickedUp: false)
    const entries = await QueueEntry.find({ pickedUp: false }).sort({ queueNumber: 1 });
    console.log(`Found ${entries.length} active queue entries`);

    const results = entries.map((entry) => {
      const rawId = entry.pickupPersonId;
      const pickupPersonId = typeof rawId === "number" ? rawId : Number(rawId);
      console.log(`Mapping entry: raw pickupPersonId=${rawId}, converted pickupPersonId=${pickupPersonId}, queueNumber=${entry.queueNumber}`);
      return {
        pickupPersonId: pickupPersonId,
        queueNumber: entry.queueNumber,
        location: liveLocations[pickupPersonId] ?? null,
      };
    });

    console.log(`Returning ${results.length} active queue entries with locations`);
    return results;
  } catch (error) {
    console.error("Get queue ranks error:", error);
    throw error;
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
