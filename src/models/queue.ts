import mongoose, { Schema, Document } from "mongoose";

export interface IQueueEntry extends Document {
  pickupPersonId: number;  // <-- Number type
  queueNumber: number;
  joinedAt: Date;          // <-- Add this
}

const QueueEntrySchema: Schema = new Schema({
  pickupPersonId: { type: Number, required: true, ref: "PickupPerson" },
  queueNumber: { type: Number, required: true },
  joinedAt: { type: Date, required: true, default: Date.now },  // <-- Add this
});

export const QueueEntry = mongoose.model<IQueueEntry>("QueueEntry", QueueEntrySchema);
export default QueueEntry;
