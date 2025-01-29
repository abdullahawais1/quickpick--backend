import express from 'express';
import {
  getAllStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/student.controller';

const router = express.Router();

router.get('/', getAllStudents);
router.post('/', createStudent);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
