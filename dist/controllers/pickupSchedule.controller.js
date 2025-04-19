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
exports.deletePickupSchedule = exports.updatePickupSchedule = exports.getPickupScheduleById = exports.createPickupSchedule = exports.getAllPickupSchedules = void 0;
const pickupschedule_1 = __importDefault(require("../models/pickupschedule"));
const student_1 = __importDefault(require("../models/student"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// ✅ Get all Pickup Schedules (with Student Details)
exports.getAllPickupSchedules = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickupSchedules = yield pickupschedule_1.default.find().populate("student_id", "id name grade section");
    res.status(200).json(pickupSchedules);
}));
exports.createPickupSchedule = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id, scheduled_pickup_time, actual_pickup_time, half_day, full_day } = req.body;
    if (!student_id || !scheduled_pickup_time) {
        throw { statusCode: 400, message: "Student ID and scheduled pickup time are required." };
    }
    // Ensure student exists
    const studentExists = yield student_1.default.findOne({ id: Number(student_id) });
    if (!studentExists) {
        throw { statusCode: 404, message: "Student not found." };
    }
    const newPickupSchedule = new pickupschedule_1.default({
        student_id: Number(student_id),
        scheduled_pickup_time,
        actual_pickup_time: actual_pickup_time || null, // Optional field
        half_day: half_day || null, // Optional field
        full_day: full_day || null, // Optional field
    });
    const savedPickupSchedule = yield newPickupSchedule.save();
    res.status(201).json(savedPickupSchedule);
}));
exports.getPickupScheduleById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = Number(req.params.id);
    const pickupSchedule = yield pickupschedule_1.default.findOne({ student_id: studentId }).populate("student_id", "id name grade section");
    if (!pickupSchedule) {
        throw { statusCode: 404, message: "Pickup schedule not found." };
    }
    res.status(200).json(pickupSchedule);
}));
exports.updatePickupSchedule = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id } = req.body;
    if (student_id !== undefined) {
        // Ensure student exists
        const studentExists = yield student_1.default.findOne({ id: Number(student_id) });
        if (!studentExists) {
            throw { statusCode: 404, message: "Student not found." };
        }
    }
    const updatedPickupSchedule = yield pickupschedule_1.default.findOneAndUpdate({ student_id: Number(req.params.id) }, Object.assign(Object.assign({}, req.body), { student_id: student_id !== undefined ? Number(student_id) : undefined }), { new: true, runValidators: true }).populate("student_id", "id name grade section");
    if (!updatedPickupSchedule) {
        throw { statusCode: 404, message: "Pickup schedule not found" };
    }
    res.status(200).json(updatedPickupSchedule);
}));
exports.deletePickupSchedule = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedPickupSchedule = yield pickupschedule_1.default.findOneAndDelete({ id: Number(req.params.id) });
    if (!deletedPickupSchedule) {
        throw { statusCode: 404, message: "Pickup schedule not found." };
    }
    res.json({ message: "Pickup schedule deleted successfully" });
}));
