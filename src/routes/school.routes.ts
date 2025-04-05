import express from 'express';
import {
  getAllSchools,
  createSchool,
  getSchoolById,
  updateSchool,
  deleteSchool,
} from '../controllers/school.controller';
import authMiddleware from '../middleware/authMiddleware';


const router = express.Router();

router.get('/', getAllSchools);
router.post('/', createSchool);
router.get('/:id', getSchoolById);
router.put('/:id', updateSchool);
router.delete('/:id', deleteSchool);

export default router;
