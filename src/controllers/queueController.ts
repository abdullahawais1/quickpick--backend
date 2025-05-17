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

export const autoJoinQueue = async (req: Request): Promise<void> => {
  const { latitude, longitude } = req.body;
  const userEmail = req.user?.email;

  if (!userEmail) throw new Error("Unauthorized: no user info");

  const user = await appUser.findOne({ email: userEmail });
  if (!user) throw new Error("App user not found");

  const pickupPerson = await PickupPerson.findOne({ email: user.email }).select("id name");
  if (!pickupPerson) throw new Error("Pickup person not found");

  const alreadyQueued = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
  if (alreadyQueued) throw new Error("You are already in the queue.");

  const queue = await QueueEntry.find().sort({ queueNumber: 1 });
  const newQueueNumber = queue.length > 0 ? queue[queue.length - 1].queueNumber + 1 : 1;

  const newEntry = new QueueEntry({
    pickupPersonId: pickupPerson.id,
    queueNumber: newQueueNumber,
    joinedAt: new Date(),
    pickedUp: false
  });

  await newEntry.save();

  // Save temporary location separately
  liveLocations[pickupPerson.id] = { latitude, longitude };

  io.emit("queueUpdated");
};

// ------------------ Get Queue Ranks ------------------

export const getQueueRanks = async (
  req: Request
): Promise<
  { pickupPersonId: number; queueNumber: number; location: { latitude: number; longitude: number } | null }[]
> => {
  const entries = await QueueEntry.find().sort({ queueNumber: 1 });

  return entries.map((entry) => ({
    pickupPersonId: entry.pickupPersonId,
    queueNumber: entry.queueNumber,
    location: liveLocations[entry.pickupPersonId] ?? null
  }));
};

// ------------------ Pickup Complete ------------------

export const pickupComplete = async (req: Request): Promise<void> => {
  const userEmail = req.user?.email;

  if (!userEmail) throw new Error("Unauthorized: no user info");

  const user = await appUser.findOne({ email: userEmail });
  if (!user) throw new Error("App user not found");

  const pickupPerson = await PickupPerson.findOne({ email: user.email }).select("id");
  if (!pickupPerson) throw new Error("Pickup person not found");

  const queueEntry = await QueueEntry.findOne({ pickupPersonId: pickupPerson.id });
  if (!queueEntry) throw new Error("You are not in the queue.");

  const removedRank = queueEntry.queueNumber;
  await queueEntry.deleteOne();

  delete liveLocations[pickupPerson.id]; // Remove location

  await QueueEntry.updateMany(
    { queueNumber: { $gt: removedRank } },
    { $inc: { queueNumber: -1 } }
  );

  io.emit("queueUpdated");
};

// ------------------ Get Children for Pickup Person ------------------

export const getQueueChildren = async (req: Request): Promise<any[]> => {
  const pickupPersonIdRaw = req.params.pickupPersonId;
  const pickupPersonId = Number(pickupPersonIdRaw);

  if (isNaN(pickupPersonId)) throw new Error("Invalid pickup person ID");

  const pickupPerson = await PickupPerson.findOne({ id: pickupPersonId });
  if (!pickupPerson) throw new Error("Pickup person not found");

  const children = await Student.find({ pickup_person: pickupPerson.id });

  const populatedChildren = await Promise.all(
    children.map(async (student) => {
      const pickupPersons = await PickupPerson.find({ id: { $in: student.pickup_person } }).select("id name phone_number email");
      return { ...student.toObject(), pickup_person: pickupPersons };
    })
  );

  return populatedChildren;
};
