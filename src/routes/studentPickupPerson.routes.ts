import express from 'express';
import {
  getAllStudentPickupPersons,
  createStudentPickupPerson,
  getStudentPickupPersonById,
  updateStudentPickupPerson,
  deleteStudentPickupPerson,
} from '../controllers/studentPickupPerson.controller';

const router = express.Router();

router.get('/', getAllStudentPickupPersons);
router.post('/', createStudentPickupPerson);
router.get('/:id', getStudentPickupPersonById);
router.put('/:id', updateStudentPickupPerson);
router.delete('/:id', deleteStudentPickupPerson);

export default router;
