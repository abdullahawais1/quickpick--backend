import express from 'express';
import {
  getAllAttendances,
  createAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendance.controller';
import authMiddleware from '../middleware/authMiddleware';


const router = express.Router();

router.get('/', getAllAttendances);
router.post('/', createAttendance);
router.get('/:id', getAttendanceById);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;
