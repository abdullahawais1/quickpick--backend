import mongoose, { Schema, Document } from "mongoose";
import { IStudent } from "./student";

export interface IAttendance extends Document {
  date: Date;
  student_id: number | IStudent; // Now a unique number instead of ObjectId
  status: boolean;
}

const AttendanceSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    student_id: { type: Number, required: true, ref: "Student" }, // Indirect reference
    status: { type: Boolean, required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// ✅ Ensure student_id has an index for faster lookups
AttendanceSchema.index({ student_id: 1 });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
