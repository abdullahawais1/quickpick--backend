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
    password: { type: String, required: true, minlength: 6, select: true },

    lastKnownLocation: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
  },
  { timestamps: true }
);

// In your appUser model file
appUserSchema.pre<IappUser>("save", async function (next) {
  // Only hash if password was modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash the password with auto-generated salt
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Improved comparePassword method
appUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Trim both passwords for comparison
  const trimmedCandidate = candidatePassword.trim();
  const trimmedStored = this.password.trim();
  
  return bcrypt.compare(trimmedCandidate, trimmedStored);
};

export default mongoose.model<IappUser>("appUser", appUserSchema);
