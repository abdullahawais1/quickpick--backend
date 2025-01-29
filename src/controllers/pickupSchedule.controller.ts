import { Request, Response } from 'express';
import PickupSchedule, { IPickupSchedule } from '../models/pickupschedule';
import asyncHandler from '../utils/asyncHandler';

export const getAllPickupSchedules = asyncHandler(async (req: Request, res: Response) => {
  const pickupSchedules: IPickupSchedule[] = await PickupSchedule.find()
    .populate('student_id');
  res.json(pickupSchedules);
});

export const createPickupSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { student_id, scheduled_pickup_time, actual_pickup_time, half_day, full_day } = req.body;

  if (!student_id || !scheduled_pickup_time || !actual_pickup_time || !half_day || !full_day) {
    throw { statusCode: 400, message: 'All fields are required.' };
  }

  const newPickupSchedule: IPickupSchedule = new PickupSchedule({
    student_id,
    scheduled_pickup_time,
    actual_pickup_time,
    half_day,
    full_day,
  });

  const savedPickupSchedule = await newPickupSchedule.save();
  res.status(201).json(savedPickupSchedule);
});

export const getPickupScheduleById = asyncHandler(async (req: Request, res: Response) => {
  const pickupSchedule: IPickupSchedule | null = await PickupSchedule.findById(req.params.id)
    .populate('student_id');

  if (!pickupSchedule) {
    throw { statusCode: 404, message: 'Pickup schedule not found' };
  }

  res.json(pickupSchedule);
});

export const updatePickupSchedule = asyncHandler(async (req: Request, res: Response) => {
  const updatedPickupSchedule: IPickupSchedule | null = await PickupSchedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('student_id');

  if (!updatedPickupSchedule) {
    throw { statusCode: 404, message: 'Pickup schedule not found' };
  }

  res.json(updatedPickupSchedule);
});

export const deletePickupSchedule = asyncHandler(async (req: Request, res: Response) => {
  const deletedPickupSchedule: IPickupSchedule | null = await PickupSchedule.findByIdAndDelete(req.params.id);

  if (!deletedPickupSchedule) {
    throw { statusCode: 404, message: 'Pickup schedule not found' };
  }

  res.json({ message: 'Pickup schedule deleted successfully' });
});
