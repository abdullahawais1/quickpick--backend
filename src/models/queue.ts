// models/queue.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQueueEntry extends Document {
  pickupPersonId: Types.ObjectId;
  queueNumber: number;
}

const QueueEntrySchema: Schema = new Schema({
  pickupPersonId: { type: Schema.Types.ObjectId, required: true, ref: "appUser" },
  queueNumber: { type: Number, required: true },
});

export const QueueEntry = mongoose.model<IQueueEntry>("QueueEntry", QueueEntrySchema);
export default QueueEntry;
``
