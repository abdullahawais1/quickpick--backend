import express, { Request, Response, NextFunction } from "express";
import {
  autoJoinQueue,
  getQueueChildren as getQueueList,
  pickupComplete as markPickedUp,
} from "../controllers/queueController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Wrapper to handle async errors without separate utility
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Protected routes (require user authentication)
router.post("/join", authMiddleware, asyncHandler(autoJoinQueue));     // Add to queue automatically based on location
router.get("/list", authMiddleware, asyncHandler(getQueueList));        // Get current queue with students
router.post("/pickup", authMiddleware, asyncHandler(markPickedUp));     // Mark pickup complete, remove from queue

export default router;
