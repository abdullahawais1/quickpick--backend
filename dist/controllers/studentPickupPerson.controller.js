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
exports.deleteStudentPickupPerson = exports.updateStudentPickupPerson = exports.getStudentPickupPersonById = exports.createStudentPickupPerson = exports.getAllStudentPickupPersons = void 0;
const studentPickupPerson_1 = __importDefault(require("../models/studentPickupPerson"));
const student_1 = __importDefault(require("../models/student"));
const pickupPerson_1 = __importDefault(require("../models/pickupPerson"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// Get all Student-Pickup Person relationships with populated student and pickup person details
exports.getAllStudentPickupPersons = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const relationships = yield studentPickupPerson_1.default.find()
        .populate("student_id", "id name grade section")
        .populate("pickup_person_id", "id name phone_number email");
    res.json(relationships);
}));
// Create a new Student-Pickup Person relationship
exports.createStudentPickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id, pickup_person_id } = req.body;
    if (!student_id || !pickup_person_id) {
        throw { statusCode: 400, message: "Student ID and Pickup Person ID are required." };
    }
    // Ensure student and pickup person exist
    const studentExists = yield student_1.default.findOne({ id: Number(student_id) });
    if (!studentExists) {
        throw { statusCode: 404, message: "Student not found." };
    }
    const pickupPersonExists = yield pickupPerson_1.default.findOne({ id: Number(pickup_person_id) });
    if (!pickupPersonExists) {
        throw { statusCode: 404, message: "Pickup Person not found." };
    }
    const newRelationship = new studentPickupPerson_1.default({
        student_id: Number(student_id),
        pickup_person_id: Number(pickup_person_id),
    });
    const savedRelationship = yield newRelationship.save();
    res.status(201).json(savedRelationship);
}));
// Get a single Student-Pickup Person relationship by ObjectId with populated details
exports.getStudentPickupPersonById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const relationship = yield studentPickupPerson_1.default.findById(req.params.id)
        .populate("student_id", "id name grade section")
        .populate("pickup_person_id", "id name phone_number email");
    if (!relationship) {
        throw { statusCode: 404, message: "Student-Pickup Person relationship not found" };
    }
    res.json(relationship);
}));
// Update a Student-Pickup Person relationship by ObjectId
exports.updateStudentPickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id, pickup_person_id } = req.body;
    if (student_id !== undefined) {
        const studentExists = yield student_1.default.findOne({ id: Number(student_id) });
        if (!studentExists) {
            throw { statusCode: 404, message: "Student not found." };
        }
    }
    if (pickup_person_id !== undefined) {
        const pickupPersonExists = yield pickupPerson_1.default.findOne({ id: Number(pickup_person_id) });
        if (!pickupPersonExists) {
            throw { statusCode: 404, message: "Pickup Person not found." };
        }
    }
    const updatedRelationship = yield studentPickupPerson_1.default.findByIdAndUpdate(req.params.id, {
        student_id: student_id !== undefined ? Number(student_id) : undefined,
        pickup_person_id: pickup_person_id !== undefined ? Number(pickup_person_id) : undefined
    }, { new: true, runValidators: true })
        .populate("student_id", "id name grade section")
        .populate("pickup_person_id", "id name phone_number email");
    if (!updatedRelationship) {
        throw { statusCode: 404, message: "Student-Pickup Person relationship not found." };
    }
    res.json(updatedRelationship);
}));
// Delete a Student-Pickup Person relationship by ObjectId
exports.deleteStudentPickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedRelationship = yield studentPickupPerson_1.default.findByIdAndDelete(req.params.id);
    if (!deletedRelationship) {
        throw { statusCode: 404, message: "Student-Pickup Person relationship not found." };
    }
    res.json({ message: "Student-Pickup Person relationship deleted successfully" });
}));
