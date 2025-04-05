import { Request, Response } from "express";
import Attendance, { IAttendance } from "../models/attendance";
import Student from "../models/student";
import asyncHandler from "../utils/asyncHandler";

// ✅ Get all attendance records with student details
export const getAllAttendances = asyncHandler(async (req: Request, res: Response) => {
  const attendances: IAttendance[] = await Attendance.find().populate(
    "student_id",
    "id name grade section"
  );

  res.json(attendances);
});

// ✅ Create a new attendance record with unique (student_id, date)
export const createAttendance = asyncHandler(async (req: Request, res: Response) => {
  let { date, student_id, status } = req.body;

  if (!date || student_id === undefined || status === undefined) {
    throw { statusCode: 400, message: "All fields are required." };
  }

  student_id = Number(student_id);
  date = new Date(date).toISOString().split("T")[0]; // Store only date (YYYY-MM-DD)

  // Ensure the student exists
  const studentExists = await Student.findOne({ id: student_id });
  if (!studentExists) {
    throw { statusCode: 404, message: "Student not found." };
  }

  // Check if attendance for the student on this date already exists
  const existingAttendance = await Attendance.findOne({ student_id, date });
  if (existingAttendance) {
    throw { statusCode: 400, message: "Attendance already recorded for this student on this date." };
  }

  const newAttendance: IAttendance = new Attendance({ date, student_id, status });
  const savedAttendance = await newAttendance.save();

  res.status(201).json(savedAttendance);
});

// ✅ Get attendance record by student_id and date
export const getAttendanceById = asyncHandler(async (req: Request, res: Response) => {
  const attendance: IAttendance | null = await Attendance.findOne({
    student_id: Number(req.params.id),
  }).populate("student_id", "id name grade section");

  if (!attendance) {
    throw { statusCode: 404, message: "Attendance record not found." };
  }

  res.json(attendance);
});

// ✅ Update attendance record by student_id and date
export const updateAttendance = asyncHandler(async (req: Request, res: Response) => {
  let { student_id, date } = req.body;

  if (student_id !== undefined) {
    student_id = Number(student_id);
    const studentExists = await Student.findOne({ id: student_id });
    if (!studentExists) {
      throw { statusCode: 404, message: "Student not found." };
    }
  }

  if (date) {
    date = new Date(date).toISOString().split("T")[0]; // Normalize date format
  }

  const updatedAttendance: IAttendance | null = await Attendance.findOneAndUpdate(
    { student_id: Number(req.params.id) },
    { ...req.body, student_id },
    { new: true, runValidators: true }
  ).populate("student_id", "id name grade section");

  if (!updatedAttendance) {
    throw { statusCode: 404, message: "Attendance record not found." };
  }

  res.json(updatedAttendance);
});

// ✅ Delete attendance record by student_id
export const deleteAttendance = asyncHandler(async (req: Request, res: Response) => {
  const deletedAttendance: IAttendance | null = await Attendance.findOneAndDelete({
    student_id: Number(req.params.id),
  });

  if (!deletedAttendance) {
    throw { statusCode: 404, message: "Attendance record not found." };
  }

  res.json({ message: "Attendance record deleted successfully" });
});
