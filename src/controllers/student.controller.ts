import { Request, Response } from 'express';
import Student, { IStudent } from '../models/student';
import asyncHandler from '../utils/asyncHandler';

export const getAllStudents = asyncHandler(async (req: Request, res: Response) => {
  const students: IStudent[] = await Student.find();
  res.json(students);
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const { name, grade, section } = req.body;

  if (!name || !grade || !section) {
    throw { statusCode: 400, message: 'All fields are required.' };
  }

  const newStudent: IStudent = new Student({ name, grade, section });
  const savedStudent = await newStudent.save();
  res.status(201).json(savedStudent);
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student: IStudent | null = await Student.findById(req.params.id);

  if (!student) {
    throw { statusCode: 404, message: 'Student not found' };
  }

  res.json(student);
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const updatedStudent: IStudent | null = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedStudent) {
    throw { statusCode: 404, message: 'Student not found' };
  }

  res.json(updatedStudent);
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const deletedStudent: IStudent | null = await Student.findByIdAndDelete(req.params.id);

  if (!deletedStudent) {
    throw { statusCode: 404, message: 'Student not found' };
  }

  res.json({ message: 'Student deleted successfully' });
});
