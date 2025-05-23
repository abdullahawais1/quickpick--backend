import express, { Request, Response, NextFunction } from "express";
import {
  autoJoinQueue,
  getQueueRanks,
  pickupCompleteHandler,  // <-- updated import to Express handler
} from "../controllers/queueController"; // Ensure file and export names match
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Protected routes
router.post("/join", authMiddleware, asyncHandler(autoJoinQueue));
router.get("/ranks", authMiddleware, asyncHandler(getQueueRanks));
router.post("/pickup", authMiddleware, asyncHandler(pickupCompleteHandler));

// Optional commented out route
// router.get("/children/:pickupPersonId", authMiddleware, asyncHandler(getQueueChildren));

export default router;
