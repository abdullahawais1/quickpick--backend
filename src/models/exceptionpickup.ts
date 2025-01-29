import mongoose, { Schema, Document } from 'mongoose';
import { IPickupPerson } from './pickupPerson';
import { IStudent } from './student';

export interface IExceptionPickup extends Document {
  pickup_person_id: mongoose.Types.ObjectId | IPickupPerson;
  student_id: mongoose.Types.ObjectId | IStudent;
  scheduled_pickup_time: Date;
}

const ExceptionPickupSchema: Schema = new Schema({
  pickup_person_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupPerson', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  scheduled_pickup_time: { type: Date, required: true },
});

export default mongoose.model<IExceptionPickup>('ExceptionPickup', ExceptionPickupSchema);
