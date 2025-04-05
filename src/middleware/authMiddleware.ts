import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any; // Optional user property to attach user info after decoding JWT
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret'; // Use the same secret

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    // If no token is provided, send a 401 response and end the middleware chain.
    res.status(401).json({ message: 'No token provided' });
    return; // Ensure no further code is executed after the response is sent.
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {  // Use JWT_SECRET here
    if (err) {
      // If the token is invalid, send a 401 response.
      res.status(401).json({ message: 'Unauthorized' });
      return; // Ensure no further code is executed after the response is sent.
    }

    // If the token is valid, attach the decoded user info to the request object.
    req.user = decoded;
    next(); // Continue to the next middleware or route handler.
  });
};

export default authMiddleware;
