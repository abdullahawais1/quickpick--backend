import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler';
import PickupPerson from '../models/pickupPerson';
import appUser from '../models/appuser';
import Student from '../models/student';
import bcrypt from 'bcryptjs'; // Ensure bcryptjs is used

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

// Signup Controller
export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone_number, cnic, password } = req.body;

  // Trim inputs
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const existingUser = await appUser.findOne({ 
    $or: [
      { email: trimmedEmail },
      { cnic },
      { phone_number }
    ]
  });

  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const pickupPerson = await PickupPerson.findOne({ 
    email: trimmedEmail, 
    cnic, 
    phone_number 
  });

  if (!pickupPerson) {
    res.status(404).json({ message: "Pickup person not found" });
    return;
  }

  // Create user with plain password - model will hash it
  const newUser = new appUser({ 
    name, 
    email: trimmedEmail, 
    phone_number, 
    cnic, 
    password: trimmedPassword 
  });

  await newUser.save();

  res.status(201).json({ message: "User registered successfully" });
});


// Login Controller with the comparePassword method
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email: rawEmail, password: rawPassword } = req.body;
  
  // Trim inputs
  const email = rawEmail.trim();
  const password = rawPassword.trim();

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await appUser.findOne({ email }).select("+password");

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" }); // Generic message for security
    return;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401).json({ message: "Invalid credentials" }); // Generic message
    return;
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email }, 
    JWT_SECRET, 
    { expiresIn: "7d" }
  );

  // Omit sensitive data from response
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email
  };

  res.json({ token, user: userData });
});

// Get Children of the Logged-in User
export const getChildren = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user; // Comes from JWT middleware

  if (!user || !user.email) {
    res.status(401).json({ message: 'Unauthorized: No user info found' });
    return;
  }

  const pickupPerson = await PickupPerson.findOne({ email: user.email });

  if (!pickupPerson) {
    res.status(404).json({ message: 'Pickup person not found' });
    return;
  }

  const students = await Student.find({ pickup_person: pickupPerson.id }).select('id name grade section');

  res.status(200).json({ children: students });
});
