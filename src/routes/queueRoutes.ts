import express, { Request, Response, NextFunction } from "express";
import {
  autoJoinQueue,
  getQueueRanks,
  pickupComplete,
} from "../controllers/queueController"; // Make sure file name matches exactly
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Async handler wrapper to catch errors
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Protected routes (require authentication)
router.post("/join", authMiddleware, asyncHandler(autoJoinQueue));         // Join queue
router.get("/ranks", authMiddleware, asyncHandler(getQueueRanks));          // Get queue ranks
router.post('/pickup', authMiddleware, async (req, res) => {
    try {
      const result = await pickupComplete(req);
      res.json(result);
    } catch (error: unknown) {
      console.error("Error in /pickup route:", error);
  
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        // fallback if error is not an Error object
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });
  //router.get("/children/:pickupPersonId", authMiddleware, asyncHandler(getQueueChildren)); // Get children by pickupPersonId

export default router;
