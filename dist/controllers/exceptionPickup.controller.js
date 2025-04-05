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
exports.deleteExceptionPickup = exports.updateExceptionPickup = exports.getExceptionPickupById = exports.createExceptionPickup = exports.getAllExceptionPickups = void 0;
const exceptionpickup_1 = __importDefault(require("../models/exceptionpickup"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getAllExceptionPickups = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exceptionPickups = yield exceptionpickup_1.default.find()
        .populate('student_id')
        .populate('pickup_person_id');
    res.json(exceptionPickups);
}));
exports.createExceptionPickup = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pickup_person_id, student_id, scheduled_pickup_time } = req.body;
    if (!pickup_person_id || !student_id || !scheduled_pickup_time) {
        throw { statusCode: 400, message: 'All fields are required.' };
    }
    const newExceptionPickup = new exceptionpickup_1.default({
        pickup_person_id,
        student_id,
        scheduled_pickup_time,
    });
    const savedExceptionPickup = yield newExceptionPickup.save();
    res.status(201).json(savedExceptionPickup);
}));
exports.getExceptionPickupById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exceptionPickup = yield exceptionpickup_1.default.findById(req.params.id)
        .populate('student_id')
        .populate('pickup_person_id');
    if (!exceptionPickup) {
        throw { statusCode: 404, message: 'Exception pickup not found' };
    }
    res.json(exceptionPickup);
}));
exports.updateExceptionPickup = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedExceptionPickup = yield exceptionpickup_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('student_id')
        .populate('pickup_person_id');
    if (!updatedExceptionPickup) {
        throw { statusCode: 404, message: 'Exception pickup not found' };
    }
    res.json(updatedExceptionPickup);
}));
exports.deleteExceptionPickup = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedExceptionPickup = yield exceptionpickup_1.default.findByIdAndDelete(req.params.id);
    if (!deletedExceptionPickup) {
        throw { statusCode: 404, message: 'Exception pickup not found' };
    }
    res.json({ message: 'Exception pickup deleted successfully' });
}));
