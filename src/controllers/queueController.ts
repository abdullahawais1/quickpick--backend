import { Request, Response } from "express";
import appUser from "../models/appuser";
import PickupPerson from "../models/pickupPerson";
import Student from "../models/student";
import QueueEntry from "../models/queue";

const SCHOOL_LOCATION = { latitude: 31.4782, longitude: 74.4938 };
const MAX_DISTANCE_TO_SCHOOL_METERS = 50;
const MIN_DISTANCE_TO_LAST_CAR_METERS = 0.5;
const MAX_DISTANCE_TO_LAST_CAR_METERS = 10;

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6378137;
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

    const user = await appUser.findOne({ email: userEmail });
    if (!user) {
      res.status(404).json({ message: "App user not found" });
      return;
    }

    const pickupPerson = await PickupPerson.findOne({ email: user.email });
    if (!pickupPerson) {
      res.status(404).json({ message: "Pickup person not found" });
      return;
    }

    const distToSchool = getDistanceMeters(latitude, longitude, SCHOOL_LOCATION.latitude, SCHOOL_LOCATION.longitude);
    if (distToSchool > MAX_DISTANCE_TO_SCHOOL_METERS) {
      res.status(400).json({ message: "You must be within 50 meters of the school to join the queue" });
      return;
    }

    const queue = await QueueEntry.find().sort({ queueNumber: 1 });

    if (queue.length === 0) {
      const newEntry = new QueueEntry({ pickupPersonId: pickupPerson._id, queueNumber: 1 });
      await newEntry.save();
      res.status(200).json({ message: "You have been added to the queue as first car.", queueNumber: 1 });
      return;
    }

    const lastEntry = queue[queue.length - 1];
    const lastPickupPerson = await PickupPerson.findById(lastEntry.pickupPersonId);
    if (!lastPickupPerson) {
      res.status(500).json({ message: "Last pickup person not found." });
      return;
    }

    const lastAppUser = await appUser.findOne({ email: lastPickupPerson.email });
    if (!lastAppUser || !lastAppUser.lastKnownLocation) {
      res.status(500).json({ message: "Last car's last known location not found." });
      return;
    }

    const distToLastCar = getDistanceMeters(
      latitude,
      longitude,
      lastAppUser.lastKnownLocation.latitude,
      lastAppUser.lastKnownLocation.longitude
    );

    if (distToLastCar >= MIN_DISTANCE_TO_LAST_CAR_METERS && distToLastCar <= MAX_DISTANCE_TO_LAST_CAR_METERS) {
      const alreadyQueued = await QueueEntry.findOne({ pickupPersonId: pickupPerson._id });
      if (alreadyQueued) {
        res.status(400).json({ message: "You are already in the queue." });
        return;
      }

      const newRank = lastEntry.queueNumber + 1;
      const newEntry = new QueueEntry({ pickupPersonId: pickupPerson._id, queueNumber: newRank });
      await newEntry.save();

      res.status(200).json({ message: `You have been added to the queue with rank ${newRank}.`, queueNumber: newRank });
      return;
    }

    res.status(400).json({ message: "You are not close enough to the last car to auto join the queue." });
  } catch (error) {
    console.error("autoJoinQueue error:", error);
    res.status(500).json({ message: "Internal server error" });
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

    const pickupPerson = await PickupPerson.findOne({ email: user.email });
    if (!pickupPerson) {
      res.status(404).json({ message: "Pickup person not found" });
      return;
    }

    const queueEntry = await QueueEntry.findOne({ pickupPersonId: pickupPerson._id });
    if (!queueEntry) {
      res.status(400).json({ message: "You are not in the queue." });
      return;
    }

    const removedRank = queueEntry.queueNumber;
    await queueEntry.deleteOne();

    await QueueEntry.updateMany(
      { queueNumber: { $gt: removedRank } },
      { $inc: { queueNumber: -1 } }
    );

    res.status(200).json({ message: "Pickup complete, you have been removed from the queue." });
  } catch (error) {
    console.error("pickupComplete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQueueWithStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const queue = await QueueEntry.find().sort({ queueNumber: 1 });

    const detailedQueue = await Promise.all(queue.map(async (entry) => {
      // use _id or the actual field for PickupPerson unique id
      const pickupPerson = await PickupPerson.findById(entry.pickupPersonId);
      if (!pickupPerson) return null;

      // students are linked by pickup_person which is unique number id (not Mongo _id)
      // so query by pickup_person field matching pickupPerson.id (your unique number)
      const students = await Student.find({ pickup_person: pickupPerson.id }).select('id name grade section');

      return {
        queueNumber: entry.queueNumber,
        pickupPerson: {
          id: pickupPerson.id,
          name: pickupPerson.name,
          email: pickupPerson.email,
        },
        students,
      };
    }));

    res.status(200).json({ queue: detailedQueue.filter(Boolean) });
  } catch (error) {
    console.error("getQueueWithStudents error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
