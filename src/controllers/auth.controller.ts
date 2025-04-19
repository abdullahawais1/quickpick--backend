import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';  // Changed from bcrypt to bcryptjs
import jwt from 'jsonwebtoken';
import User from '../models/user';
import asyncHandler from '../utils/asyncHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

// POST /signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !password) {
    throw { statusCode: 400, message: 'Username and password are required.' };
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw { statusCode: 409, message: 'Username is already taken.' };
  }

  // 3. Hash the password using bcryptjs
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);  // bcryptjs.hash() works similarly to bcrypt.hash()

  // 4. Create the user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });
  await newUser.save();

  // 5. Generate token
  const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({
    message: 'Signup successful',
    user: { username: newUser.username, email: newUser.email },
    token,
  });
});

// POST /login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 1. Basic validation
  if (!username || !password) {
    throw { statusCode: 400, message: 'Username and password are required.' };
  }

  // 2. Find user by username
  const user = await User.findOne({ username });
  if (!user) {
    throw { statusCode: 401, message: 'Invalid username or password.' };
  }

  // 3. Compare passwords using bcryptjs
  const isMatch = await bcrypt.compare(password, user.password);  // bcryptjs.compare() works similarly to bcrypt.compare()
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid username or password.' };
  }

  // 4. Generate JWT
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

  res.json({
    message: 'Login successful',
    user: { username: user.username, email: user.email },
    token,
  });
});
