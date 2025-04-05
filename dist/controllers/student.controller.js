"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.createStudent = exports.getAllStudents = void 0;
const student_1 = __importDefault(require("../models/student"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getAllStudents = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const students = yield student_1.default.find();
    res.json(students);
}));
exports.createStudent = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, grade, section } = req.body;
    if (!name || !grade || !section) {
        throw { statusCode: 400, message: 'All fields are required.' };
    }
    const newStudent = new student_1.default({ name, grade, section });
    const savedStudent = yield newStudent.save();
    res.status(201).json(savedStudent);
}));
exports.getStudentById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield student_1.default.findById(req.params.id);
    if (!student) {
        throw { statusCode: 404, message: 'Student not found' };
    }
    res.json(student);
}));
exports.updateStudent = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedStudent = yield student_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedStudent) {
        throw { statusCode: 404, message: 'Student not found' };
    }
    res.json(updatedStudent);
}));
exports.deleteStudent = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedStudent = yield student_1.default.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
        throw { statusCode: 404, message: 'Student not found' };
    }
    res.json({ message: 'Student deleted successfully' });
}));
