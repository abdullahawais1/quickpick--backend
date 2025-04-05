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
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getAllPickupSchedules = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickupSchedules = yield pickupschedule_1.default.find()
        .populate('student_id');
    res.json(pickupSchedules);
}));
exports.createPickupSchedule = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id, scheduled_pickup_time, actual_pickup_time, half_day, full_day } = req.body;
    if (!student_id || !scheduled_pickup_time || !actual_pickup_time || !half_day || !full_day) {
        throw { statusCode: 400, message: 'All fields are required.' };
    }
    const newPickupSchedule = new pickupschedule_1.default({
        student_id,
        scheduled_pickup_time,
        actual_pickup_time,
        half_day,
        full_day,
    });
    const savedPickupSchedule = yield newPickupSchedule.save();
    res.status(201).json(savedPickupSchedule);
}));
exports.getPickupScheduleById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickupSchedule = yield pickupschedule_1.default.findById(req.params.id)
        .populate('student_id');
    if (!pickupSchedule) {
        throw { statusCode: 404, message: 'Pickup schedule not found' };
    }
    res.json(pickupSchedule);
}));
exports.updatePickupSchedule = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedPickupSchedule = yield pickupschedule_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('student_id');
    if (!updatedPickupSchedule) {
        throw { statusCode: 404, message: 'Pickup schedule not found' };
    }
    res.json(updatedPickupSchedule);
}));
exports.deletePickupSchedule = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedPickupSchedule = yield pickupschedule_1.default.findByIdAndDelete(req.params.id);
    if (!deletedPickupSchedule) {
        throw { statusCode: 404, message: 'Pickup schedule not found' };
    }
    res.json({ message: 'Pickup schedule deleted successfully' });
}));
