"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const student_controller_1 = require("../controllers/student.controller");
const router = express_1.default.Router();
router.get('/', student_controller_1.getAllStudents);
router.post('/', student_controller_1.createStudent);
router.get('/:id', student_controller_1.getStudentById);
router.put('/:id', student_controller_1.updateStudent);
router.delete('/:id', student_controller_1.deleteStudent);
exports.default = router;
