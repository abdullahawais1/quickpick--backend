import express, { Application, Request, Response } from 'express';
import connectDB from './config/db';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';

import vehicleRoutes from './routes/vehicle.routes';
import authRoutes from './routes/auth.routes'; 
import studentRoutes from './routes/student.routes';
import attendanceRoutes from './routes/attendance.routes';
import pickupPersonRoutes from './routes/pickupPerson.routes';
import pickupScheduleRoutes from './routes/pickupSchedule.routes';
import exceptionPickupRoutes from './routes/exceptionPickup.routes';
import schoolRoutes from './routes/school.routes';
import studentPickupPersonRoutes from './routes/studentPickupPerson.routes';
import userAuthRoutes from './routes/appRoutes'; 

// Load environment variables from .env file
dotenv.config();

// Initialize Express
const app: Application = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// Connect to MongoDB
connectDB();

app.use('/vehicles', vehicleRoutes);
app.use('/auth', authRoutes);  // backend ui
app.use('/auth/user', userAuthRoutes); // mobile app
app.use('/students', studentRoutes);
app.use('/attendances', attendanceRoutes);
app.use('/pickup-persons', pickupPersonRoutes);
app.use('/pickup-schedules', pickupScheduleRoutes);
app.use('/exception-pickups', exceptionPickupRoutes);
app.use('/schools', schoolRoutes);
app.use('/student-pickup-persons', studentPickupPersonRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the School Management API!');
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
