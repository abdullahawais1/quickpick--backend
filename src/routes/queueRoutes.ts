import express from "express";
import {
  autoJoinQueue,     
  getQueueWithStudents as getQueueList,  
  pickupComplete as markPickedUp,        
} from "../controllers/queueController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Protected routes (require user authentication)
router.post("/join", authMiddleware, autoJoinQueue);       // Add to queue automatically based on location
router.get("/list", authMiddleware, getQueueList);         // Get current queue with students
router.post("/pickup", authMiddleware, markPickedUp);      // Mark pickup complete, remove from queue

export default router;
