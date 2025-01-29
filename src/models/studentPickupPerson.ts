import mongoose, { Schema, Document } from 'mongoose';
import { IStudent } from './student';
import { IPickupPerson } from './pickupPerson';

export interface IStudentPickupPerson extends Document {
  student_id: mongoose.Types.ObjectId | IStudent;
  pickup_person_id: mongoose.Types.ObjectId | IPickupPerson;
}

const StudentPickupPersonSchema: Schema = new Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  pickup_person_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupPerson', required: true },
});

export default mongoose.model<IStudentPickupPerson>('StudentPickupPerson', StudentPickupPersonSchema);
