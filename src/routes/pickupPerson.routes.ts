import express from 'express';
import {
  getAllPickupPersons,
  createPickupPerson,
  getPickupPersonById,
  updatePickupPerson,
  deletePickupPerson,
} from '../controllers/pickupPerson.controller';

const router = express.Router();

router.get('/', getAllPickupPersons);
router.post('/', createPickupPerson);
router.get('/:id', getPickupPersonById);
router.put('/:id', updatePickupPerson);
router.delete('/:id', deletePickupPerson);

export default router;
