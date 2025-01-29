import express from 'express';
import {
  getAllExceptionPickups,
  createExceptionPickup,
  getExceptionPickupById,
  updateExceptionPickup,
  deleteExceptionPickup,
} from '../controllers/exceptionPickup.controller';

const router = express.Router();

router.get('/', getAllExceptionPickups);
router.post('/', createExceptionPickup);
router.get('/:id', getExceptionPickupById);
router.put('/:id', updateExceptionPickup);
router.delete('/:id', deleteExceptionPickup);

export default router;
