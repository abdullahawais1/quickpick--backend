import { Request, Response } from "express";
import Vehicle from "../models/vehicle";
import asyncHandler from "../utils/asyncHandler";

// ✅ Get all vehicles
export const getAllVehicles = asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
});

// ✅ Create a new vehicle with a unique numeric ID
export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const { name, num_plate, color } = req.body;

  if (!name || !num_plate || !color) {
    throw { statusCode: 400, message: "All fields are required." };
  }

  // Ensure `num_plate` is unique
  const existingVehicle = await Vehicle.findOne({ num_plate });
  if (existingVehicle) {
    throw { statusCode: 400, message: "Vehicle number plate must be unique." };
  }

  // Generate unique numeric ID
  const lastVehicle = await Vehicle.findOne().sort({ id: -1 });
  const newVehicleId = lastVehicle ? lastVehicle.id + 1 : 1; // Start from 1 if no records exist

  // Create new vehicle
  const newVehicle = new Vehicle({ id: newVehicleId, name, num_plate, color });
  const savedVehicle = await newVehicle.save();
  
  res.status(201).json(savedVehicle);
});

// ✅ Get vehicle by unique numeric ID
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await Vehicle.findOne({ id: Number(req.params.id) });

  if (!vehicle) {
    throw { statusCode: 404, message: "Vehicle not found." };
  }

  res.json(vehicle);
});

// ✅ Update vehicle by unique numeric ID
export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const updatedVehicle = await Vehicle.findOneAndUpdate(
    { id: Number(req.params.id) }, // Find by numeric ID
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedVehicle) {
    throw { statusCode: 404, message: "Vehicle not found." };
  }

  res.json(updatedVehicle);
});

// ✅ Delete vehicle by unique numeric ID
export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const deletedVehicle = await Vehicle.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedVehicle) {
    throw { statusCode: 404, message: "Vehicle not found." };
  }

  res.json({ message: "Vehicle deleted successfully" });
});
