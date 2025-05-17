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
  let authHeader = req.headers["authorization"] || req.headers["Authorization"];

  console.log("Received Authorization header:", authHeader);

  if (Array.isArray(authHeader)) {
    authHeader = authHeader[0];
  }

  if (!authHeader) {
    console.log("No Authorization header provided");
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Authorization header does not contain token");
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("JWT decoded successfully:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
