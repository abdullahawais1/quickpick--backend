import { Request } from "express";
import appUser from "../models/appuser";
import PickupPerson from "../models/pickupPerson";
import Student from "../models/student";
import QueueEntry from "../models/queue";
import { io } from "../socket";

// Temporary in-memory location store
const liveLocations: {
  [pickupPersonId: number]: { latitude: number; longitude: number };
} = {};

// ------------------ Join Queue ------------------
export const autoJoinQueue = async (req: Request): Promise<{ message: string }> => {
  try {
    const { latitude, longitude } = req.body;
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      throw new Error("Unauthorized: no user info");
    }
    
    const user = await appUser.findOne({ email: userEmail });
    if (!user) {
      throw new Error("App user not found");
    }
    
    // Find the pickup person - ensure we're passing this as a string to match the database format
    const pickupPerson = await PickupPerson.findOne({ email: userEmail }).select("id name");
    if (!pickupPerson) {
      throw new Error("Pickup person not found");
    }
    
    // Check if already in queue - don't throw, just return a message
    const alreadyQueued = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
    if (alreadyQueued) {
      return { message: "You are already in the queue." };
    }
    
    // Get current highest queue number
    const queue = await QueueEntry.find().sort({ queueNumber: -1 }).limit(1);
    const newQueueNumber = queue.length > 0 ? queue[0].queueNumber + 1 : 1;
    
    const newEntry = new QueueEntry({
      pickupPersonId: pickupPerson.id,
      queueNumber: newQueueNumber,
      joinedAt: new Date(),
      pickedUp: false
    });
    
    await newEntry.save();
    
    // Save temporary location separately
    liveLocations[pickupPerson.id] = { latitude, longitude };
    
    // Notify clients about queue update
    io.emit("queueUpdated");
    
    return { message: `Successfully joined the queue at position ${newQueueNumber}` };
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Join queue error:", error);
    throw error;
  }
};

// ------------------ Get Queue Ranks ------------------
export const getQueueRanks = async (
  req: Request
): Promise<
  { pickupPersonId: number; queueNumber: number; location: { latitude: number; longitude: number } | null }[]
> => {
  try {
    // Get user info to determine if they're in the queue
    const userEmail = req.user?.email;
    
    // Enhanced logging for debugging
    console.log("getQueueRanks called with user email:", userEmail);
    
    if (!userEmail) {
      throw new Error("Unauthorized: no user info");
    }
    
    // Find the user by email - it seems your authentication is working, so this must be finding the user
    const user = await appUser.findOne({ email: userEmail });
    console.log("Found appUser:", user ? "yes" : "no");
    
    if (!user) {
      throw new Error("App user not found");
    }
    
    // Fetch queue entries sorted by queue number
    console.log("Fetching queue entries...");
    const entries = await QueueEntry.find().sort({ queueNumber: 1 });
    console.log(`Found ${entries.length} queue entries`);
    
    // Map the entries - this was the original source of the bug
    // We need to ensure we're converting pickupPersonId to number consistently
    const results = entries.map((entry) => {
      const pickupPersonId = Number(entry.pickupPersonId);
      return {
        pickupPersonId,
        queueNumber: entry.queueNumber,
        location: liveLocations[pickupPersonId] ?? null
      };
    });
    
    console.log(`Returning ${results.length} queue entries with locations`);
    return results;
  } catch (error) {
    console.error("Get queue ranks error:", error);
    throw error;
  }
};

// ------------------ Pickup Complete ------------------
export const pickupComplete = async (req: Request): Promise<{ message: string }> => {
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
    
    const queueEntry = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
    if (!queueEntry) {
      throw new Error("You are not in the queue.");
    }
    
    const removedRank = queueEntry.queueNumber;
    await queueEntry.deleteOne();
    
    // Remove location
    delete liveLocations[pickupPerson.id];
    
    // Reorder queue numbers for everyone after this person
    await QueueEntry.updateMany(
      { queueNumber: { $gt: removedRank } },
      { $inc: { queueNumber: -1 } }
    );
    
    // Notify clients
    io.emit("queueUpdated");
    
    return { message: "Pickup completed successfully" };
  } catch (error) {
    console.error("Pickup complete error:", error);
    throw error;
  }
};

// ------------------ Get Children for Pickup Person ------------------
export const getQueueChildren = async (req: Request): Promise<any[]> => {
  try {
    const pickupPersonIdRaw = req.params.pickupPersonId;
    const pickupPersonId = Number(pickupPersonIdRaw);
    
    if (isNaN(pickupPersonId)) {
      throw new Error("Invalid pickup person ID");
    }
    
    const pickupPerson = await PickupPerson.findOne({ id: pickupPersonId });
    if (!pickupPerson) {
      throw new Error("Pickup person not found");
    }
    
    const children = await Student.find({ pickup_person: pickupPersonId });
    
    const populatedChildren = await Promise.all(
      children.map(async (student) => {
        const pickupPersons = await PickupPerson.find(
          { id: { $in: student.pickup_person } }
        ).select("id name phone_number email");
        
        return { ...student.toObject(), pickup_person: pickupPersons };
      })
    );
    
    return populatedChildren;
  } catch (error) {
    console.error("Get queue children error:", error);
    throw error;
  }
};