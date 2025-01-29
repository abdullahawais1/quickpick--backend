import mongoose, { Schema, Document } from 'mongoose';
import { IStudent } from './student';

export interface IPickupSchedule extends Document {
  student_id: mongoose.Types.ObjectId | IStudent;
  scheduled_pickup_time: Date;
  actual_pickup_time: Date;
  half_day: Date;
  full_day: Date;
}

const PickupScheduleSchema: Schema = new Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  scheduled_pickup_time: { type: Date, required: true },
  actual_pickup_time: { type: Date, required: true },
  half_day: { type: Date, required: true },
  full_day: { type: Date, required: true },
});

export default mongoose.model<IPickupSchedule>('PickupSchedule', PickupScheduleSchema);
