import { Request, Response } from "express";
import appUser from "../models/appuser";
import PickupPerson from "../models/pickupPerson";
import Student from "../models/student";
import QueueEntry from "../models/queue";

const SCHOOL_LOCATION = { latitude: 31.4782, longitude: 74.4938 };
const MAX_DISTANCE_TO_SCHOOL_METERS = 50;

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

// ------------------ Auto Join Queue ------------------

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

    const pickupPerson = await PickupPerson.findOne({ email: user.email }).select("id name");
    if (!pickupPerson) {
      res.status(404).json({ message: "Pickup person not found" });
      return;
    }

    const distToSchool = getDistanceMeters(
      latitude,
      longitude,
      SCHOOL_LOCATION.latitude,
      SCHOOL_LOCATION.longitude
    );

    if (distToSchool > MAX_DISTANCE_TO_SCHOOL_METERS) {
      res.status(400).json({ message: "You must be within 50 meters of the school to join the queue" });
      return;
    }

    const alreadyQueued = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
    if (alreadyQueued) {
      res.status(400).json({ message: "You are already in the queue." });
      return;
    }

    const queue = await QueueEntry.find().sort({ queueNumber: 1 });
    const newQueueNumber = queue.length > 0 ? queue[queue.length - 1].queueNumber + 1 : 1;

    const newEntry = new QueueEntry({
      pickupPersonId: pickupPerson.id,
      queueNumber: newQueueNumber
    });

    await newEntry.save();

    res.status(200).json({
      message: `You have been added to the queue with rank ${newQueueNumber}.`,
      queueNumber: newQueueNumber
    });
  } catch (error) {
    console.error("Error in autoJoinQueue:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ------------------ Pickup Complete ------------------

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

    await QueueEntry.updateMany(
      { queueNumber: { $gt: removedRank } },
      { $inc: { queueNumber: -1 } }
    );

    res.status(200).json({ message: "Pickup complete, you have been removed from the queue." });
  } catch (error) {
    console.error("Error in pickupComplete:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ------------------ Get Queue Children ------------------

export const getQueueChildren = async (req: Request, res: Response): Promise<void> => {
  const pickupPersonIdRaw = req.params.pickupPersonId;

  const pickupPersonId = Number(pickupPersonIdRaw);
  if (isNaN(pickupPersonId)) {
    res.status(400).json({ msg: "Invalid pickup person ID" });
    return;
  }

  const pickupPerson = await PickupPerson.findOne({ id: pickupPersonId });
  if (!pickupPerson) {
    res.status(404).json({ msg: "PickupPerson not found." });
    return;
  }

  const children = await Student.find({ pickup_person: pickupPerson.id });

  const populatedChildren = await Promise.all(
    children.map(async (student) => {
      const pickupPersons = await PickupPerson.find({ id: { $in: student.pickup_person } })
        .select("id name phone_number email");
      return { ...student.toObject(), pickup_person: pickupPersons };
    })
  );

  res.status(200).json(populatedChildren);
};
