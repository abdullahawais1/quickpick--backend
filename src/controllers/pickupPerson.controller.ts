import { Request, Response } from 'express';
import PickupPerson, { IPickupPerson } from '../models/pickupPerson';
import asyncHandler from '../utils/asyncHandler';

export const getAllPickupPersons = asyncHandler(async (req: Request, res: Response) => {
  const pickupPersons: IPickupPerson[] = await PickupPerson.find().populate('vehicle_id');
  res.json(pickupPersons);
});

export const createPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone_number, vehicle_id, email, location_access } = req.body;

  if (!name || !phone_number || !vehicle_id || !email || !location_access) {
    throw { statusCode: 400, message: 'All fields are required.' };
  }

  const newPickupPerson: IPickupPerson = new PickupPerson({
    name,
    phone_number,
    vehicle_id,
    email,
    location_access,
  });

  const savedPickupPerson = await newPickupPerson.save();
  res.status(201).json(savedPickupPerson);
});

export const getPickupPersonById = asyncHandler(async (req: Request, res: Response) => {
  const pickupPerson: IPickupPerson | null = await PickupPerson.findById(req.params.id).populate('vehicle_id');

  if (!pickupPerson) {
    throw { statusCode: 404, message: 'Pickup person not found.' };
  }

  res.json(pickupPerson);
});

export const updatePickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const updatedPickupPerson: IPickupPerson | null = await PickupPerson.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('vehicle_id');

  if (!updatedPickupPerson) {
    throw { statusCode: 404, message: 'Pickup person not found.' };
  }

  res.json(updatedPickupPerson);
});

export const deletePickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const deletedPickupPerson: IPickupPerson | null = await PickupPerson.findByIdAndDelete(req.params.id);

  if (!deletedPickupPerson) {
    throw { statusCode: 404, message: 'Pickup person not found.' };
  }

  res.json({ message: 'Pickup person deleted successfully' });
});
