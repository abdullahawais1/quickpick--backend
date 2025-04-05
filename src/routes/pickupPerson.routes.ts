import express from 'express'; 
import {
  getAllPickupPersons,
  createPickupPerson,
  getPickupPersonById,
  updatePickupPerson,
  deletePickupPerson,
  clearStudents
} from '../controllers/pickupPerson.controller';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.patch("/:id/clear-students", clearStudents);
router.get('/', authMiddleware, getAllPickupPersons);
router.post('/', authMiddleware, createPickupPerson);
router.get('/:id', authMiddleware, getPickupPersonById);
router.put('/:id', authMiddleware, updatePickupPerson);
router.delete('/:id', authMiddleware, deletePickupPerson);

export default router;
