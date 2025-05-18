import mongoose, { Schema, Document } from "mongoose";

export interface IQueueEntry extends Document {
  pickupPersonId: number;
  queueNumber: number;
  joinedAt: Date;
  pickedUp: boolean;  // Add this field here
}

const QueueEntrySchema: Schema = new Schema({
  pickupPersonId: { type: Number, required: true, ref: "PickupPerson" },
  queueNumber: { type: Number, required: true },
  joinedAt: { type: Date, required: true, default: Date.now },
  pickedUp: { type: Boolean, required: true, default: false },  // Add to schema
});

export const QueueEntry = mongoose.model<IQueueEntry>("QueueEntry", QueueEntrySchema);
export default QueueEntry;
