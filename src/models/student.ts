import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  grade: string;
  section: string;
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  grade: { type: String, required: true },
  section: { type: String, required: true },
});

export default mongoose.model<IStudent>('Student', StudentSchema);
