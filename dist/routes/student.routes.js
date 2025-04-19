"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const student_controller_1 = require("../controllers/student.controller");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.get('/', authMiddleware_1.default, student_controller_1.getAllStudents);
router.post('/', authMiddleware_1.default, student_controller_1.createStudent);
router.get("/by-grade-section", authMiddleware_1.default, student_controller_1.getStudentsByGradeSection);
router.get('/:id', authMiddleware_1.default, student_controller_1.getStudentById);
router.put('/:id', authMiddleware_1.default, student_controller_1.updateStudent);
router.put('/:id/add-pickup-person', authMiddleware_1.default, student_controller_1.addPickupPersonToStudent);
router.delete('/:id', authMiddleware_1.default, student_controller_1.deleteStudent);
exports.default = router;
