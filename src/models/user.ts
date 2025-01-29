import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: false, unique: false },
  password: { type: String, required: true },
});

export default mongoose.model<IUser>('User', userSchema);
