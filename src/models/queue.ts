// models/queue.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQueueEntry extends Document {
  pickupPersonId: number;  // <-- Change to number
  queueNumber: number;
}

const QueueEntrySchema: Schema = new Schema({
  pickupPersonId: { type: Number, required: true, ref: "PickupPerson" }, // <-- Number type and correct ref
  queueNumber: { type: Number, required: true },
});

export const QueueEntry = mongoose.model<IQueueEntry>("QueueEntry", QueueEntrySchema);
export default QueueEntry;
