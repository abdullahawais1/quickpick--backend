import express from "express";
import { signup, login, getChildren } from "../controllers/appController";
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get('/children', authMiddleware, getChildren);

export default router;
