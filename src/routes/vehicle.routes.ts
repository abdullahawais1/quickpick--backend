import express from 'express';
import {
  getAllVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware,  getAllVehicles);
router.post('/', authMiddleware,  createVehicle);
router.get('/:id',authMiddleware,  getVehicleById);
router.put('/:id',authMiddleware,  updateVehicle);
router.delete('/:id',authMiddleware,  deleteVehicle);

export default router;
