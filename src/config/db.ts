import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://dbUser:helloworld@cluster0.swuii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
