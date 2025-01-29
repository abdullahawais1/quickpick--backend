import mongoose, { Schema, Document } from 'mongoose';
import { IVehicle } from './vehicle';

export interface IPickupPerson extends Document {
  name: string;
  phone_number: string;
  vehicle_id: mongoose.Types.ObjectId | IVehicle;
  email: string;
  location_access: string;
}

const PickupPersonSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  email: { type: String, required: true },
  location_access: { type: String, required: true },
});

export default mongoose.model<IPickupPerson>('PickupPerson', PickupPersonSchema);
