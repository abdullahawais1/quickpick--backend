import { Request, Response, NextFunction } from 'express';

// Custom Error Handling Middleware
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err.message || err);

  // Set status code based on error or default to 500
  const statusCode = err.statusCode || 500;

  // Prepare error response
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred', // Use error message if available
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Show stack trace only in development
  });
};

export default errorHandler;



