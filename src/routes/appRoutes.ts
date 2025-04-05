import express from "express";
import { signup, login } from "../controllers/appController";
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
