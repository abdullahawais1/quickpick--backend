import { Request, Response } from "express";
import ExceptionPickup, { IExceptionPickup } from "../models/exceptionpickup";
import Student from "../models/student";
import PickupPerson from "../models/pickupPerson";
import asyncHandler from "../utils/asyncHandler";

export const getAllExceptionPickups = asyncHandler(async (req: Request, res: Response) => {
  const exceptionPickups: IExceptionPickup[] = await ExceptionPickup.find()
    .populate("student_id", "id name grade section") // Populate student details
    .populate("pickup_person_id", "id name phone"); // Populate pickup person details

  res.json(exceptionPickups);
});

export const createExceptionPickup = asyncHandler(async (req: Request, res: Response) => {
  const { pickup_person_id, student_id, scheduled_pickup_time } = req.body;

  if (!pickup_person_id || !student_id || !scheduled_pickup_time) {
    throw { statusCode: 400, message: "All fields are required." };
  }

  // Ensure student exists
  const studentExists = await Student.findOne({ id: Number(student_id) });
  if (!studentExists) {
    throw { statusCode: 404, message: "Student not found." };
  }

  // Ensure pickup person exists
  const pickupPersonExists = await PickupPerson.findOne({ id: Number(pickup_person_id) });
  if (!pickupPersonExists) {
    throw { statusCode: 404, message: "Pickup person not found." };
  }

  const newExceptionPickup: IExceptionPickup = new ExceptionPickup({
    pickup_person_id: Number(pickup_person_id),
    student_id: Number(student_id),
    scheduled_pickup_time,
  });

  const savedExceptionPickup = await newExceptionPickup.save();
  res.status(201).json(savedExceptionPickup);
});

export const getExceptionPickupById = asyncHandler(async (req: Request, res: Response) => {
  const exceptionPickup: IExceptionPickup | null = await ExceptionPickup.findById(req.params.id)
    .populate("student_id", "id name grade section")
    .populate("pickup_person_id", "id name phone");

  if (!exceptionPickup) {
    throw { statusCode: 404, message: "Exception pickup not found" };
  }

  res.json(exceptionPickup);
});

export const updateExceptionPickup = asyncHandler(async (req: Request, res: Response) => {
  const { pickup_person_id, student_id } = req.body;

  if (pickup_person_id !== undefined) {
    const pickupPersonExists = await PickupPerson.findOne({ id: Number(pickup_person_id) });
    if (!pickupPersonExists) {
      throw { statusCode: 404, message: "Pickup person not found." };
    }
  }

  if (student_id !== undefined) {
    const studentExists = await Student.findOne({ id: Number(student_id) });
    if (!studentExists) {
      throw { statusCode: 404, message: "Student not found." };
    }
  }

  const updatedExceptionPickup: IExceptionPickup | null = await ExceptionPickup.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      pickup_person_id: pickup_person_id !== undefined ? Number(pickup_person_id) : undefined,
      student_id: student_id !== undefined ? Number(student_id) : undefined,
    },
    { new: true, runValidators: true }
  )
    .populate("student_id", "id name grade section")
    .populate("pickup_person_id", "id name phone");

  if (!updatedExceptionPickup) {
    throw { statusCode: 404, message: "Exception pickup not found." };
  }

  res.json(updatedExceptionPickup);
});

export const deleteExceptionPickup = asyncHandler(async (req: Request, res: Response) => {
  const deletedExceptionPickup: IExceptionPickup | null = await ExceptionPickup.findByIdAndDelete(req.params.id);

  if (!deletedExceptionPickup) {
    throw { statusCode: 404, message: "Exception pickup not found." };
  }

  res.json({ message: "Exception pickup deleted successfully" });
});
