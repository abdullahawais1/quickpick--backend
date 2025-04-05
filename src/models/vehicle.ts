import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  id: number; 
  name: string;
  num_plate: string;
  color: string;
}

const VehicleSchema: Schema = new Schema(
  {
    id: { type: Number, unique: true, required: true }, // Unique number as primary key
    name: { type: String, required: true },
    num_plate: { type: String, required: true, unique: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

// Ensure `id` is the primary key instead of MongoDB's default `_id`
VehicleSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret.id; // Explicitly include `id`
    delete ret._id;  // Remove MongoDB's default `_id`
    delete ret.__v;  
    return ret;
  },
});

// Ensure `id` is indexed uniquely
VehicleSchema.index({ id: 1 }, { unique: true });

export default mongoose.model<IVehicle>("Vehicle", VehicleSchema);
