import { Request, Response } from 'express';
import Vehicle, { IVehicle } from '../models/vehicle';
import asyncHandler from '../utils/asyncHandler';

export const getAllVehicles = asyncHandler(async (req: Request, res: Response) => {
  const vehicles: IVehicle[] = await Vehicle.find();
  res.json(vehicles);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const { name, num_plate, color } = req.body;

  
  if (!name || !num_plate || !color) {
    throw { statusCode: 400, message: 'All fields are required.' };
  }

  const newVehicle: IVehicle = new Vehicle({ name, num_plate, color });
  const savedVehicle = await newVehicle.save();
  res.status(201).json(savedVehicle);
});

export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const vehicle: IVehicle | null = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw { statusCode: 404, message: 'Vehicle not found.' };
  }

  res.json(vehicle);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const updatedVehicle: IVehicle | null = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedVehicle) {
    throw { statusCode: 404, message: 'Vehicle not found.' };
  }

  res.json(updatedVehicle);
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const deletedVehicle: IVehicle | null = await Vehicle.findByIdAndDelete(req.params.id);

  if (!deletedVehicle) {
    throw { statusCode: 404, message: 'Vehicle not found.' };
  }

  res.json({ message: 'Vehicle deleted successfully' });
});
