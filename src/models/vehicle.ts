import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  name: string;
  num_plate: string;
  color: string;
}

const VehicleSchema: Schema = new Schema({
  name: { type: String, required: true },
  num_plate: { type: String, required: true },
  color: { type: String, required: true },
});

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);
