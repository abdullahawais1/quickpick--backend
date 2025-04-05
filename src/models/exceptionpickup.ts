import mongoose, { Schema, Document } from "mongoose";
import { IPickupPerson } from "./pickupPerson";
import { IStudent } from "./student";

export interface IExceptionPickup extends Document {
  pickup_person_id: number | IPickupPerson; // Changed from ObjectId to number
  student_id: number | IStudent; // Changed from ObjectId to number
  scheduled_pickup_time: Date;
}

const ExceptionPickupSchema: Schema = new Schema({
  pickup_person_id: { type: Number, required: true, ref: "PickupPerson" }, // Reference as a number
  student_id: { type: Number, required: true, ref: "Student" }, // Reference as a number
  scheduled_pickup_time: { type: Date, required: true },
});

export default mongoose.model<IExceptionPickup>("ExceptionPickup", ExceptionPickupSchema);
