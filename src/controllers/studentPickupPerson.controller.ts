import { Request, Response } from "express";
import StudentPickupPerson, { IStudentPickupPerson } from "../models/studentPickupPerson";
import Student from "../models/student";
import PickupPerson from "../models/pickupPerson";
import asyncHandler from "../utils/asyncHandler";

// Get all Student-Pickup Person relationships with populated student and pickup person details
export const getAllStudentPickupPersons = asyncHandler(async (req: Request, res: Response) => {
  const relationships: IStudentPickupPerson[] = await StudentPickupPerson.find()
    .populate("student_id", "id name grade section")
    .populate("pickup_person_id", "id name phone_number email");

  res.json(relationships);
});

// Create a new Student-Pickup Person relationship
export const createStudentPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const { student_id, pickup_person_id } = req.body;

  if (!student_id || !pickup_person_id) {
    throw { statusCode: 400, message: "Student ID and Pickup Person ID are required." };
  }

  // Ensure student and pickup person exist
  const studentExists = await Student.findOne({ id: Number(student_id) });
  if (!studentExists) {
    throw { statusCode: 404, message: "Student not found." };
  }

  const pickupPersonExists = await PickupPerson.findOne({ id: Number(pickup_person_id) });
  if (!pickupPersonExists) {
    throw { statusCode: 404, message: "Pickup Person not found." };
  }

  const newRelationship: IStudentPickupPerson = new StudentPickupPerson({
    student_id: Number(student_id),
    pickup_person_id: Number(pickup_person_id),
  });

  const savedRelationship = await newRelationship.save();
  res.status(201).json(savedRelationship);
});

// Get a single Student-Pickup Person relationship by ObjectId with populated details
export const getStudentPickupPersonById = asyncHandler(async (req: Request, res: Response) => {
  const relationship: IStudentPickupPerson | null = await StudentPickupPerson.findById(req.params.id)
    .populate("student_id", "id name grade section")
    .populate("pickup_person_id", "id name phone_number email");

  if (!relationship) {
    throw { statusCode: 404, message: "Student-Pickup Person relationship not found" };
  }

  res.json(relationship);
});

// Update a Student-Pickup Person relationship by ObjectId
export const updateStudentPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const { student_id, pickup_person_id } = req.body;

  if (student_id !== undefined) {
    const studentExists = await Student.findOne({ id: Number(student_id) });
    if (!studentExists) {
      throw { statusCode: 404, message: "Student not found." };
    }
  }

  if (pickup_person_id !== undefined) {
    const pickupPersonExists = await PickupPerson.findOne({ id: Number(pickup_person_id) });
    if (!pickupPersonExists) {
      throw { statusCode: 404, message: "Pickup Person not found." };
    }
  }

  const updatedRelationship: IStudentPickupPerson | null = await StudentPickupPerson.findByIdAndUpdate(
    req.params.id,
    { 
      student_id: student_id !== undefined ? Number(student_id) : undefined, 
      pickup_person_id: pickup_person_id !== undefined ? Number(pickup_person_id) : undefined 
    },
    { new: true, runValidators: true }
  )
    .populate("student_id", "id name grade section")
    .populate("pickup_person_id", "id name phone_number email");

  if (!updatedRelationship) {
    throw { statusCode: 404, message: "Student-Pickup Person relationship not found." };
  }

  res.json(updatedRelationship);
});

// Delete a Student-Pickup Person relationship by ObjectId
export const deleteStudentPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const deletedRelationship: IStudentPickupPerson | null = await StudentPickupPerson.findByIdAndDelete(req.params.id);

  if (!deletedRelationship) {
    throw { statusCode: 404, message: "Student-Pickup Person relationship not found." };
  }

  res.json({ message: "Student-Pickup Person relationship deleted successfully" });
});
