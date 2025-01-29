import mongoose, { Schema, Document } from 'mongoose';
import { IStudent } from './student';

export interface IAttendance extends Document {
  date: Date;
  student_id: mongoose.Types.ObjectId | IStudent;
  status: boolean;
}

const AttendanceSchema: Schema = new Schema({
  date: { type: Date, required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: Boolean, required: true },
});

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
