import express from 'express';
import {
  getAllStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByGradeSection,
  addPickupPersonToStudent
} from '../controllers/student.controller';
import authMiddleware from '../middleware/authMiddleware';


const router = express.Router();


router.get('/', authMiddleware, getAllStudents);
router.post('/', authMiddleware, createStudent);
router.get("/by-grade-section", authMiddleware, getStudentsByGradeSection);
router.get('/:id',authMiddleware, getStudentById);
router.put('/:id', authMiddleware, updateStudent);
router.put('/:id/add-pickup-person', authMiddleware, addPickupPersonToStudent);
router.delete('/:id', authMiddleware, deleteStudent);

export default router;
