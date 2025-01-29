import { Request, Response } from 'express';
import ExceptionPickup, { IExceptionPickup } from '../models/exceptionpickup';
import asyncHandler from '../utils/asyncHandler';

export const getAllExceptionPickups = asyncHandler(async (req: Request, res: Response) => {
  const exceptionPickups: IExceptionPickup[] = await ExceptionPickup.find()
    .populate('student_id')
    .populate('pickup_person_id');

  res.json(exceptionPickups);
});

export const createExceptionPickup = asyncHandler(async (req: Request, res: Response) => {
  const { pickup_person_id, student_id, scheduled_pickup_time } = req.body;

  if (!pickup_person_id || !student_id || !scheduled_pickup_time) {
    throw { statusCode: 400, message: 'All fields are required.' };
  }

  const newExceptionPickup: IExceptionPickup = new ExceptionPickup({
    pickup_person_id,
    student_id,
    scheduled_pickup_time,
  });

  const savedExceptionPickup = await newExceptionPickup.save();
  res.status(201).json(savedExceptionPickup);
});

export const getExceptionPickupById = asyncHandler(async (req: Request, res: Response) => {
  const exceptionPickup: IExceptionPickup | null = await ExceptionPickup.findById(req.params.id)
    .populate('student_id')
    .populate('pickup_person_id');

  if (!exceptionPickup) {
    throw { statusCode: 404, message: 'Exception pickup not found' };
  }

  res.json(exceptionPickup);
});

export const updateExceptionPickup = asyncHandler(async (req: Request, res: Response) => {
  const updatedExceptionPickup: IExceptionPickup | null = await ExceptionPickup.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('student_id')
    .populate('pickup_person_id');

  if (!updatedExceptionPickup) {
    throw { statusCode: 404, message: 'Exception pickup not found' };
  }

  res.json(updatedExceptionPickup);
});

export const deleteExceptionPickup = asyncHandler(async (req: Request, res: Response) => {
  const deletedExceptionPickup: IExceptionPickup | null = await ExceptionPickup.findByIdAndDelete(req.params.id);

  if (!deletedExceptionPickup) {
    throw { statusCode: 404, message: 'Exception pickup not found' };
  }

  res.json({ message: 'Exception pickup deleted successfully' });
});
