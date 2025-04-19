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
exports.deleteAttendance = exports.updateAttendance = exports.getAttendanceById = exports.createAttendance = exports.getAllAttendances = void 0;
const attendance_1 = __importDefault(require("../models/attendance"));
const student_1 = __importDefault(require("../models/student"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// ✅ Get all attendance records with student details
exports.getAllAttendances = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attendances = yield attendance_1.default.find().populate("student_id", "id name grade section");
    res.json(attendances);
}));
// ✅ Create a new attendance record with unique (student_id, date)
exports.createAttendance = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { date, student_id, status } = req.body;
    if (!date || student_id === undefined || status === undefined) {
        throw { statusCode: 400, message: "All fields are required." };
    }
    student_id = Number(student_id);
    date = new Date(date).toISOString().split("T")[0]; // Store only date (YYYY-MM-DD)
    // Ensure the student exists
    const studentExists = yield student_1.default.findOne({ id: student_id });
    if (!studentExists) {
        throw { statusCode: 404, message: "Student not found." };
    }
    // Check if attendance for the student on this date already exists
    const existingAttendance = yield attendance_1.default.findOne({ student_id, date });
    if (existingAttendance) {
        throw { statusCode: 400, message: "Attendance already recorded for this student on this date." };
    }
    const newAttendance = new attendance_1.default({ date, student_id, status });
    const savedAttendance = yield newAttendance.save();
    res.status(201).json(savedAttendance);
}));
// ✅ Get attendance record by student_id and date
exports.getAttendanceById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attendance = yield attendance_1.default.findOne({
        student_id: Number(req.params.id),
    }).populate("student_id", "id name grade section");
    if (!attendance) {
        throw { statusCode: 404, message: "Attendance record not found." };
    }
    res.json(attendance);
}));
// ✅ Update attendance record by student_id and date
exports.updateAttendance = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { student_id, date } = req.body;
    if (student_id !== undefined) {
        student_id = Number(student_id);
        const studentExists = yield student_1.default.findOne({ id: student_id });
        if (!studentExists) {
            throw { statusCode: 404, message: "Student not found." };
        }
    }
    if (date) {
        date = new Date(date).toISOString().split("T")[0]; // Normalize date format
    }
    const updatedAttendance = yield attendance_1.default.findOneAndUpdate({ student_id: Number(req.params.id) }, Object.assign(Object.assign({}, req.body), { student_id }), { new: true, runValidators: true }).populate("student_id", "id name grade section");
    if (!updatedAttendance) {
        throw { statusCode: 404, message: "Attendance record not found." };
    }
    res.json(updatedAttendance);
}));
// ✅ Delete attendance record by student_id
exports.deleteAttendance = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedAttendance = yield attendance_1.default.findOneAndDelete({
        student_id: Number(req.params.id),
    });
    if (!deletedAttendance) {
        throw { statusCode: 404, message: "Attendance record not found." };
    }
    res.json({ message: "Attendance record deleted successfully" });
}));
