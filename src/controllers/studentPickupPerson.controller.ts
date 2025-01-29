import { Request, Response } from 'express';
import StudentPickupPerson, { IStudentPickupPerson } from '../models/studentPickupPerson';
import asyncHandler from '../utils/asyncHandler';

export const getAllStudentPickupPersons = asyncHandler(async (req: Request, res: Response) => {
  const relationships: IStudentPickupPerson[] = await StudentPickupPerson.find()
    .populate('student_id')
    .populate('pickup_person_id');
  res.json(relationships);
});

export const createStudentPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const { student_id, pickup_person_id } = req.body;

  if (!student_id || !pickup_person_id) {
    throw { statusCode: 400, message: 'Student ID and Pickup Person ID are required.' };
  }

  const newRelationship: IStudentPickupPerson = new StudentPickupPerson({
    student_id,
    pickup_person_id,
  });

  const savedRelationship = await newRelationship.save();
  res.status(201).json(savedRelationship);
});

export const getStudentPickupPersonById = asyncHandler(async (req: Request, res: Response) => {
  const relationship: IStudentPickupPerson | null = await StudentPickupPerson.findById(req.params.id)
    .populate('student_id')
    .populate('pickup_person_id');

  if (!relationship) {
    throw { statusCode: 404, message: 'Student-Pickup Person relationship not found' };
  }

  res.json(relationship);
});

export const updateStudentPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const updatedRelationship: IStudentPickupPerson | null = await StudentPickupPerson.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('student_id')
    .populate('pickup_person_id');

  if (!updatedRelationship) {
    throw { statusCode: 404, message: 'Student-Pickup Person relationship not found' };
  }

  res.json(updatedRelationship);
});

export const deleteStudentPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const deletedRelationship: IStudentPickupPerson | null = await StudentPickupPerson.findByIdAndDelete(
    req.params.id
  );

  if (!deletedRelationship) {
    throw { statusCode: 404, message: 'Student-Pickup Person relationship not found' };
  }

  res.json({ message: 'Student-Pickup Person relationship deleted successfully' });
});
