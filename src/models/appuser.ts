import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IappUser extends Document {
  name: string;
  email: string;
  phone_number: string;
  cnic: number;
  password: string;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const appUserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone_number: { type: String, required: true },
    cnic: { type: Number, unique: true, required: true },
    password: { type: String, required: true, minlength: 6, select: false },

    // Add lastKnownLocation as a nested object with lat/lng
    lastKnownLocation: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
  },
  { timestamps: true }
);

// Hash password before saving
appUserSchema.pre<IappUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
appUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IappUser>("appUser", appUserSchema);
