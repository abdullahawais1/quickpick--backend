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
exports.deletePickupPerson = exports.updatePickupPerson = exports.getPickupPersonById = exports.createPickupPerson = exports.getAllPickupPersons = void 0;
const pickupPerson_1 = __importDefault(require("../models/pickupPerson"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getAllPickupPersons = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickupPersons = yield pickupPerson_1.default.find().populate('vehicle_id');
    res.json(pickupPersons);
}));
exports.createPickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone_number, vehicle_id, email, location_access } = req.body;
    if (!name || !phone_number || !vehicle_id || !email || !location_access) {
        throw { statusCode: 400, message: 'All fields are required.' };
    }
    const newPickupPerson = new pickupPerson_1.default({
        name,
        phone_number,
        vehicle_id,
        email,
        location_access,
    });
    const savedPickupPerson = yield newPickupPerson.save();
    res.status(201).json(savedPickupPerson);
}));
exports.getPickupPersonById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickupPerson = yield pickupPerson_1.default.findById(req.params.id).populate('vehicle_id');
    if (!pickupPerson) {
        throw { statusCode: 404, message: 'Pickup person not found.' };
    }
    res.json(pickupPerson);
}));
exports.updatePickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedPickupPerson = yield pickupPerson_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('vehicle_id');
    if (!updatedPickupPerson) {
        throw { statusCode: 404, message: 'Pickup person not found.' };
    }
    res.json(updatedPickupPerson);
}));
exports.deletePickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedPickupPerson = yield pickupPerson_1.default.findByIdAndDelete(req.params.id);
    if (!deletedPickupPerson) {
        throw { statusCode: 404, message: 'Pickup person not found.' };
    }
    res.json({ message: 'Pickup person deleted successfully' });
}));
