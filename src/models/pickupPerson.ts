import mongoose, { Schema, Document } from "mongoose";
import { IStudent } from "./student";

export interface IPickupPerson extends Document {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  cnic: number;
  vehicle_id?: number;
  students: number[];
}

const PickupPersonSchema: Schema = new Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    phone_number: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cnic: { type: Number, unique: true, required: true },
    vehicle_id: { type: Number, ref: "Vehicle", required: true },
    students: [{ type: Number, ref: "Student" }],
  }
);

// Pre-save hook to set _id to the custom id
PickupPersonSchema.pre("save", function (next) {
  if (this.isNew) {
    this._id = this.id; // Set _id to the custom id
  }
  next();
});

export default mongoose.model<IPickupPerson>("PickupPerson", PickupPersonSchema);
