import mongoose, { Schema, Document } from "mongoose";
import { IStudent } from "./student";
import { IPickupPerson } from "./pickupPerson";

export interface IStudentPickupPerson extends Document {
  student_id: number | IStudent; // Unique number
  pickup_person_id: number | IPickupPerson; // Unique number
}

const StudentPickupPersonSchema: Schema = new Schema(
  {
    student_id: { type: Number, required: true, ref: "Student" }, 
    pickup_person_id: { type: Number, required: true, ref: "PickupPerson" }, 
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.model<IStudentPickupPerson>("StudentPickupPerson", StudentPickupPersonSchema);
