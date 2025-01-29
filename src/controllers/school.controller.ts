import { Request, Response } from 'express';
import School, { ISchool } from '../models/school';
import asyncHandler from '../utils/asyncHandler';

export const getAllSchools = asyncHandler(async (req: Request, res: Response) => {
  const schools: ISchool[] = await School.find();
  res.json(schools);
});

export const createSchool = asyncHandler(async (req: Request, res: Response) => {
  const { name, address, phone_number, email } = req.body;

  if (!name || !address || !phone_number || !email) {
    throw { statusCode: 400, message: 'All fields are required.' };
  }

  const newSchool: ISchool = new School({ name, address, phone_number, email });
  const savedSchool = await newSchool.save();
  res.status(201).json(savedSchool);
});

export const getSchoolById = asyncHandler(async (req: Request, res: Response) => {
  const school: ISchool | null = await School.findById(req.params.id);

  if (!school) {
    throw { statusCode: 404, message: 'School not found' };
  }

  res.json(school);
});

export const updateSchool = asyncHandler(async (req: Request, res: Response) => {
  const updatedSchool: ISchool | null = await School.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedSchool) {
    throw { statusCode: 404, message: 'School not found' };
  }

  res.json(updatedSchool);
});

export const deleteSchool = asyncHandler(async (req: Request, res: Response) => {
  const deletedSchool: ISchool | null = await School.findByIdAndDelete(req.params.id);

  if (!deletedSchool) {
    throw { statusCode: 404, message: 'School not found' };
  }

  res.json({ message: 'School deleted successfully' });
});
