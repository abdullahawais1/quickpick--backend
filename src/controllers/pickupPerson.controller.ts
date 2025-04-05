import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import PickupPerson from "../models/pickupPerson";
import Vehicle from "../models/vehicle"; // Assuming you have a Vehicle model
import Student from "../models/student"; // Assuming you have a Student model

// ✅ Clear the students array for a specific PickupPerson
export const clearStudents = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;  // Get the pickup person id from the URL params

  // Find the pickup person by their `id`
  const pickupPerson = await PickupPerson.findOne({ id: Number(id) });

  // If the PickupPerson doesn't exist, return an error
  if (!pickupPerson) {
    res.status(404).json({ msg: "PickupPerson not found." });
    return;
  }

  // Update the PickupPerson to empty the students array
  pickupPerson.students = [];  // Empty the students array

  // Save the updated PickupPerson document
  await pickupPerson.save();

  // Return a success response
  res.status(200).json({ msg: "Students array cleared successfully.", pickupPerson });
});

export const getAllPickupPersons = asyncHandler(async (_req: Request, res: Response) => {
  // Find all pickup persons
  const pickupPersons = await PickupPerson.find().select("-__v");

  // Manually populate students and vehicle details
  const populatedPickupPersons = await Promise.all(
    pickupPersons.map(async (person) => {
      // Manually populate students by querying Student with custom 'id'
      const students = await Student.find({ id: { $in: person.students } })
        .select("id name grade section")
        .lean(); // Return plain objects for easier manipulation

      // Manually populate the vehicle details if vehicle_id exists
      const vehicle = person.vehicle_id ? await Vehicle.findOne({ id: person.vehicle_id }).select("id model plate_number") : null;

      return { ...person.toObject(), students, vehicle }; // Merge student and vehicle data
    })
  );

  res.status(200).json(populatedPickupPersons); // Return the populated data
});



// ✅ Get Pickup Person by ID (with Vehicle Details)
export const getPickupPersonById = asyncHandler(async (req: Request, res: Response) => {
  const pickupPerson = await PickupPerson.findOne({ id: Number(req.params.id) });

  if (!pickupPerson) {
    res.status(404).json({ msg: "PickupPerson not found." });
    return;
  }

  const vehicle = pickupPerson.vehicle_id ? await Vehicle.findOne({ id: pickupPerson.vehicle_id }).select("id model plate_number") : null;

  res.status(200).json({ ...pickupPerson.toObject(), vehicle });
});

// ✅ Create a new PickupPerson
export const createPickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone_number, email, cnic, vehicle_id } = req.body;

  if (!name || !phone_number || !email || !cnic) {
    res.status(400).json({ msg: "Name, phone_number, email, and cnic are required." });
    return;
  }

  // Ensure CNIC and vehicle_id (if provided) are numbers
  const cnicNumber = Number(cnic);
  const vehicleId = vehicle_id ? Number(vehicle_id) : undefined;

  // Check if CNIC or Email already exists
  const existingPickupPerson = await PickupPerson.findOne({ $or: [{ cnic: cnicNumber }, { email }] });
  if (existingPickupPerson) {
    res.status(400).json({ msg: "CNIC or Email already exists." });
    return;
  }

  // If vehicle_id is provided, check if the vehicle exists
  if (vehicleId) {
    const vehicleExists = await Vehicle.findOne({ id: vehicleId });
    if (!vehicleExists) {
      res.status(404).json({ msg: "Vehicle not found." });
      return;
    }
  }

  // Generate unique ID
  const lastPickupPerson = await PickupPerson.find().select("id").sort("-id").limit(1);
  const newPickupPersonId = lastPickupPerson.length ? lastPickupPerson[0].id + 1 : 1;

  const newPickupPerson = new PickupPerson({
    id: newPickupPersonId,
    name,
    phone_number,
    email,
    cnic: cnicNumber,
    vehicle_id: vehicleId,
  });

  await newPickupPerson.save();
  res.status(201).json({ msg: "PickupPerson created successfully", pickupPerson: newPickupPerson });
});

// ✅ Update PickupPerson by ID (Ensure Vehicle Exists)
export const updatePickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const { cnic, vehicle_id } = req.body;

  // Ensure CNIC and vehicle_id (if provided) are numbers
  if (cnic !== undefined) {
    req.body.cnic = Number(cnic);
  }
  if (vehicle_id !== undefined) {
    req.body.vehicle_id = Number(vehicle_id);
  }

  // If vehicle_id is provided, check if the vehicle exists
  if (vehicle_id !== undefined) {
    const vehicleExists = await Vehicle.findOne({ id: vehicle_id });
    if (!vehicleExists) {
      res.status(404).json({ msg: "Vehicle not found." });
      return;
    }
  }

  const updatedPickupPerson = await PickupPerson.findOneAndUpdate({ id: Number(req.params.id) }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPickupPerson) {
    res.status(404).json({ msg: "PickupPerson not found." });
    return;
  }

  const vehicle = updatedPickupPerson.vehicle_id
    ? await Vehicle.findOne({ id: updatedPickupPerson.vehicle_id }).select("id model plate_number")
    : null;

  res.status(200).json({ ...updatedPickupPerson.toObject(), vehicle });
});

// ✅ Delete PickupPerson by ID
export const deletePickupPerson = asyncHandler(async (req: Request, res: Response) => {
  const deletedPickupPerson = await PickupPerson.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedPickupPerson) {
    res.status(404).json({ msg: "PickupPerson not found." });
    return;
  }

  res.status(200).json({ msg: "PickupPerson deleted successfully" });
});
