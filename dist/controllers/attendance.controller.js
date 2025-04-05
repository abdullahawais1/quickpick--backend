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
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getAllAttendances = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attendances = yield attendance_1.default.find().populate('student_id');
    res.json(attendances);
}));
exports.createAttendance = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, student_id, status } = req.body;
    if (!date || !student_id || status === undefined) {
        throw { statusCode: 400, message: 'All fields are required.' };
    }
    const newAttendance = new attendance_1.default({ date, student_id, status });
    const savedAttendance = yield newAttendance.save();
    res.status(201).json(savedAttendance);
}));
exports.getAttendanceById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attendance = yield attendance_1.default.findById(req.params.id).populate('student_id');
    if (!attendance) {
        throw { statusCode: 404, message: 'Attendance record not found' };
    }
    res.json(attendance);
}));
exports.updateAttendance = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedAttendance = yield attendance_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('student_id');
    if (!updatedAttendance) {
        throw { statusCode: 404, message: 'Attendance record not found' };
    }
    res.json(updatedAttendance);
}));
exports.deleteAttendance = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedAttendance = yield attendance_1.default.findByIdAndDelete(req.params.id);
    if (!deletedAttendance) {
        throw { statusCode: 404, message: 'Attendance record not found' };
    }
    res.json({ message: 'Attendance record deleted successfully' });
}));
