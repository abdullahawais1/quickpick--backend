import express from 'express';
import {
  getAllPickupSchedules,
  createPickupSchedule,
  getPickupScheduleById,
  updatePickupSchedule,
  deletePickupSchedule,
} from '../controllers/pickupSchedule.controller';
import authMiddleware from '../middleware/authMiddleware';


const router = express.Router();

router.get('/', getAllPickupSchedules);
router.post('/', createPickupSchedule);
router.get('/:id', getPickupScheduleById);
router.put('/:id', updatePickupSchedule);
router.delete('/:id', deletePickupSchedule);

export default router;
