import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  address: string;
  phone_number: string;
  email: string;
}

const SchoolSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, required: true },
});

export default mongoose.model<ISchool>('School', SchoolSchema);
