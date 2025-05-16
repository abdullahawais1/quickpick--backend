import { Request, Response } from "express";
import appUser from "../models/appuser";
import PickupPerson from "../models/pickupPerson";
import QueueEntry from "../models/queue";
import { SCHOOL_LOCATION, QUEUE_CONFIG } from "../config/locations";

// Shared distance calculation function
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6378137; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const autoJoinQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({ message: "Unauthorized: no user info" });
      return;
    }

    if (
      latitude === undefined ||
      longitude === undefined ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      res.status(400).json({ message: "Invalid or missing latitude/longitude" });
      return;
    }

    const user = await appUser.findOne({ email: userEmail });
    if (!user) {
      res.status(404).json({ message: "App user not found" });
      return;
    }

    const pickupPerson = await PickupPerson.findOne({ email: user.email }).select("id name");
    if (!pickupPerson) {
      res.status(404).json({ message: "Pickup person not found" });
      return;
    }

    // Check distance to school using shared calculation
    const distToSchool = getDistanceMeters(
      latitude,
      longitude,
      SCHOOL_LOCATION.latitude,
      SCHOOL_LOCATION.longitude
    );

    if (distToSchool > QUEUE_CONFIG.maxDistanceToSchoolMeters) {
        res.status(400).json({ 
          message: `You must be within ${QUEUE_CONFIG.maxDistanceToSchoolMeters} meters of the school to join the queue`,
          distance: distToSchool,
          maxDistance: QUEUE_CONFIG.maxDistanceToSchoolMeters
        });
        return;
      }
      

    // Check if already in queue
    const alreadyQueued = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
    if (alreadyQueued) {
      res.status(400).json({ 
        message: "You are already in the queue.",
        currentRank: alreadyQueued.queueNumber
      });
      return;
    }

    // Get current queue sorted by queueNumber ascending
    const queue = await QueueEntry.find().sort({ queueNumber: 1 });

    if (queue.length === 0) {
      // Queue empty, add as first car
      const newEntry = new QueueEntry({
        pickupPersonId: pickupPerson.id,
        queueNumber: 1,
        joinedAt: new Date()
      });
      await newEntry.save();
      
      res.status(200).json({ 
        message: "You have been added to the queue as first car.", 
        queueNumber: 1,
        distanceToSchool: distToSchool
      });
      return;
    }

    // For non-empty queue, verify distance to last car
    const lastEntry = queue[queue.length - 1];
    const lastPickupPerson = await PickupPerson.findOne({ id: lastEntry.pickupPersonId }).select("id name email");
    if (!lastPickupPerson) {
      res.status(500).json({ message: "Last pickup person not found." });
      return;
    }

    // Get last app user and their last known location
    const lastAppUser = await appUser.findOne({ email: lastPickupPerson.email });
    if (!lastAppUser || !lastAppUser.lastKnownLocation) {
      res.status(500).json({ message: "Last car's last known location not found." });
      return;
    }

    // Calculate distance to last car
    const distToLastCar = getDistanceMeters(
      latitude,
      longitude,
      lastAppUser.lastKnownLocation.latitude,
      lastAppUser.lastKnownLocation.longitude
    );

    // Check distance constraints to last car
    if (distToLastCar < QUEUE_CONFIG.minDistanceToLastCarMeters) {
      res.status(400).json({ 
        message: `You are too close to the last car (${distToLastCar.toFixed(2)}m). Please move back.`,
        requiredMinDistance: QUEUE_CONFIG.minDistanceToLastCarMeters
      });
      return;
    }

    if (distToLastCar > QUEUE_CONFIG.maxDistanceToLastCarMeters) {
      res.status(400).json({ 
        message: `You are too far from the last car (${distToLastCar.toFixed(2)}m). Move closer to join the queue.`,
        requiredMaxDistance: QUEUE_CONFIG.maxDistanceToLastCarMeters
      });
      return;
    }

    // Add new entry with next queue number
    const newRank = lastEntry.queueNumber + 1;
    const newEntry = new QueueEntry({
      pickupPersonId: pickupPerson.id,
      queueNumber: newRank,
      joinedAt: new Date()
    });
    await newEntry.save();

    res.status(200).json({ 
      message: `You have been added to the queue with rank ${newRank}.`,
      queueNumber: newRank,
      distanceToSchool: distToSchool,
      distanceToLastCar: distToLastCar
    });
  } catch (error) {
    console.error("Error in autoJoinQueue:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const pickupComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({ message: "Unauthorized: no user info" });
      return;
    }

    const user = await appUser.findOne({ email: userEmail });
    if (!user) {
      res.status(404).json({ message: "App user not found" });
      return;
    }

    const pickupPerson = await PickupPerson.findOne({ email: user.email }).select("id");
    if (!pickupPerson) {
      res.status(404).json({ message: "Pickup person not found" });
      return;
    }

    const queueEntry = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
    if (!queueEntry) {
      res.status(400).json({ message: "You are not in the queue." });
      return;
    }

    const removedRank = queueEntry.queueNumber;
    await queueEntry.deleteOne();

    // Decrement queueNumbers of entries with queueNumber greater than removed rank
    await QueueEntry.updateMany(
      { queueNumber: { $gt: removedRank } },
      { $inc: { queueNumber: -1 } }
    );

    res.status(200).json({ 
      message: "Pickup complete, you have been removed from the queue.",
      removedRank,
      queueLength: await QueueEntry.countDocuments()
    });
  } catch (error) {
    console.error("Error in pickupComplete:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getQueueStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get current queue sorted by queueNumber ascending
    const queue = await QueueEntry.find()
      .sort({ queueNumber: 1 })
      .select("pickupPersonId queueNumber joinedAt")
      .lean();

    // Add additional pickup person info
    const queueWithDetails = await Promise.all(
      queue.map(async (entry) => {
        const pickupPerson = await PickupPerson.findOne({ id: entry.pickupPersonId })
          .select("name email")
          .lean();
        return {
          ...entry,
          pickupPerson
        };
      })
    );

    res.status(200).json({
      schoolLocation: SCHOOL_LOCATION,
      queue: queueWithDetails,
      queueLength: queue.length,
      maxDistanceToSchool: QUEUE_CONFIG.maxDistanceToSchoolMeters,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error in getQueueStatus:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getUserQueuePosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({ message: "Unauthorized: no user info" });
      return;
    }

    const pickupPerson = await PickupPerson.findOne({ email: userEmail }).select("id");
    if (!pickupPerson) {
      res.status(404).json({ message: "Pickup person not found" });
      return;
    }

    const queueEntry = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
    if (!queueEntry) {
      res.status(200).json({ 
        inQueue: false,
        message: "You are not currently in the queue."
      });
      return;
    }

    const totalInQueue = await QueueEntry.countDocuments();
    
    res.status(200).json({
      inQueue: true,
      queueNumber: queueEntry.queueNumber,
      totalInQueue,
      estimatedWaitTime: calculateWaitTime(queueEntry.queueNumber), // Implement this based on your logic
      joinedAt: queueEntry.joinedAt
    });
  } catch (error) {
    console.error("Error in getUserQueuePosition:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Helper function to estimate wait time (customize based on your requirements)
function calculateWaitTime(position: number): number {
  // Example: 2 minutes per car ahead
  return (position - 1) * 2;
}