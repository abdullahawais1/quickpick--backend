import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from '../utils/asyncHandler';
import PickupPerson from '../models/pickupPerson';
import appUser from '../models/appuser';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

// ✅ Signup Controller
export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, phone_number, cnic, password } = req.body;

    // ✅ Check if a user with the same email, cnic, and phone_number already exists
    const existingUser = await appUser.findOne({ email, cnic, phone_number });

    if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // ✅ Ensure a pickup person exists with the same email, cnic, and phone_number
    const pickupPerson = await PickupPerson.findOne({ email, cnic, phone_number });

    if (!pickupPerson) {
        res.status(404).json({ message: 'Pickup person not found' });
        return;
    }

    // ✅ Create a new user (NO manual password hashing, model does it)
    const newUser = new appUser({ name, email, phone_number, cnic, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
});

// ✅ Login Controller
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    // ✅ Find user by email and include password field
    const user = await appUser.findOne({ email }).select("+password");

    if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }

    // ✅ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
    });

    res.json({ token });
});
