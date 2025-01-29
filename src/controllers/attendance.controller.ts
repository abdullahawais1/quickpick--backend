import { Request, Response } from 'express';
import Attendance, { IAttendance } from '../models/attendance';
import asyncHandler from '../utils/asyncHandler';

export const getAllAttendances = asyncHandler(async (req: Request, res: Response) => {
  const attendances: IAttendance[] = await Attendance.find().populate('student_id');
  res.json(attendances);
});

export const createAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { date, student_id, status } = req.body;

  if (!date || !student_id || status === undefined) {
    throw { statusCode: 400, message: 'All fields are required.' };
  }

  const newAttendance: IAttendance = new Attendance({ date, student_id, status });
  const savedAttendance = await newAttendance.save();
  res.status(201).json(savedAttendance);
});

export const getAttendanceById = asyncHandler(async (req: Request, res: Response) => {
  const attendance: IAttendance | null = await Attendance.findById(req.params.id).populate('student_id');

  if (!attendance) {
    throw { statusCode: 404, message: 'Attendance record not found' };
  }

  res.json(attendance);
});

export const updateAttendance = asyncHandler(async (req: Request, res: Response) => {
  const updatedAttendance: IAttendance | null = await Attendance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('student_id');

  if (!updatedAttendance) {
    throw { statusCode: 404, message: 'Attendance record not found' };
  }

  res.json(updatedAttendance);
});

export const deleteAttendance = asyncHandler(async (req: Request, res: Response) => {
  const deletedAttendance: IAttendance | null = await Attendance.findByIdAndDelete(req.params.id);

  if (!deletedAttendance) {
    throw { statusCode: 404, message: 'Attendance record not found' };
  }

  res.json({ message: 'Attendance record deleted successfully' });
});
