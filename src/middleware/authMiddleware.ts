import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecret";

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  let authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (Array.isArray(authHeader)) {
    // If header is array, take the first element
    authHeader = authHeader[0];
  }

  if (!authHeader) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];  // now safe to split

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    req.user = decoded;
    next();
  });
};
export default authMiddleware;
