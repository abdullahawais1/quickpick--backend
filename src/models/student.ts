import mongoose, { Schema, Document } from "mongoose";
import { IPickupPerson } from "./pickupPerson";

export interface IStudent extends Document {
  id: number;
  name: string;
  grade: string;
  section: string;
  pickup_person: number[] | IPickupPerson[];
}

const StudentSchema: Schema = new Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String, required: true },
    pickup_person: [{ type: Number, ref: "PickupPerson", required: true }],
  }
);

// Pre-save hook to set _id to the custom id
StudentSchema.pre("save", function (next) {
  if (this.isNew) {
    this._id = this.id; // Set _id to the custom id
  }
  next();
});

StudentSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IStudent>("Student", StudentSchema);
