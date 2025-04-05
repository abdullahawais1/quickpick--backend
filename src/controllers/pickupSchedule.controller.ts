import { Request, Response } from "express";
import PickupSchedule, { IPickupSchedule } from "../models/pickupschedule";
import Student from "../models/student";
import asyncHandler from "../utils/asyncHandler";

// ✅ Get all Pickup Schedules (with Student Details)
export const getAllPickupSchedules = asyncHandler(async (req: Request, res: Response) => {
  const pickupSchedules: IPickupSchedule[] = await PickupSchedule.find().populate(
    "student_id",
    "id name grade section"
  );
  res.status(200).json(pickupSchedules);
});

export const createPickupSchedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { student_id, scheduled_pickup_time, actual_pickup_time, half_day, full_day } = req.body;

  if (!student_id || !scheduled_pickup_time) {
    throw { statusCode: 400, message: "Student ID and scheduled pickup time are required." };
  }

  // Ensure student exists
  const studentExists = await Student.findOne({ id: Number(student_id) });
  if (!studentExists) {
    throw { statusCode: 404, message: "Student not found." };
  }

  const newPickupSchedule: IPickupSchedule = new PickupSchedule({
    student_id: Number(student_id),
    scheduled_pickup_time,
    actual_pickup_time: actual_pickup_time || null, // Optional field
    half_day: half_day || null, // Optional field
    full_day: full_day || null, // Optional field
  });

  const savedPickupSchedule = await newPickupSchedule.save();
  res.status(201).json(savedPickupSchedule);
});

export const getPickupScheduleById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const studentId = Number(req.params.id);
  const pickupSchedule: IPickupSchedule | null = await PickupSchedule.findOne({ student_id: studentId }).populate(
    "student_id",
    "id name grade section"
  );

  if (!pickupSchedule) {
    throw { statusCode: 404, message: "Pickup schedule not found." };
  }

  res.status(200).json(pickupSchedule);
});


export const updatePickupSchedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { student_id } = req.body;

  if (student_id !== undefined) {
    // Ensure student exists
    const studentExists = await Student.findOne({ id: Number(student_id) });
    if (!studentExists) {
      throw { statusCode: 404, message: "Student not found." };
    }
  }

  const updatedPickupSchedule: IPickupSchedule | null = await PickupSchedule.findOneAndUpdate(
    { student_id: Number(req.params.id) },
    { ...req.body, student_id: student_id !== undefined ? Number(student_id) : undefined },
    { new: true, runValidators: true }
  ).populate("student_id", "id name grade section");

  if (!updatedPickupSchedule) {
    throw { statusCode: 404, message: "Pickup schedule not found" };
  }

  res.status(200).json(updatedPickupSchedule);
});


export const deletePickupSchedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const deletedPickupSchedule = await PickupSchedule.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedPickupSchedule) {
    throw { statusCode: 404, message: "Pickup schedule not found." };
  }

  res.json({ message: "Pickup schedule deleted successfully" });
});

