import mongoose, { Schema, Document } from "mongoose";
import { IStudent } from "./student";

export interface IPickupSchedule extends Document {
  student_id: number | IStudent; // Changed to Number instead of ObjectId
  scheduled_pickup_time: Date;
  actual_pickup_time: Date;
  half_day: Date;
  full_day: Date;
}

const PickupScheduleSchema: Schema = new Schema(
  {
    student_id: { type: Number, required: true, ref: "Student" }, // Using Number as a reference
    scheduled_pickup_time: { type: Date, required: true },
    actual_pickup_time: { type: Date, required: true },
    half_day: { type: Date, required: true },
    full_day: { type: Date, required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.model<IPickupSchedule>("PickupSchedule", PickupScheduleSchema);
