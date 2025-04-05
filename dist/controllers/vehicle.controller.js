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
exports.deleteVehicle = exports.updateVehicle = exports.getVehicleById = exports.createVehicle = exports.getAllVehicles = void 0;
const vehicle_1 = __importDefault(require("../models/vehicle"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getAllVehicles = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vehicles = yield vehicle_1.default.find();
    res.json(vehicles);
}));
exports.createVehicle = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, num_plate, color } = req.body;
    if (!name || !num_plate || !color) {
        throw { statusCode: 400, message: 'All fields are required.' };
    }
    const newVehicle = new vehicle_1.default({ name, num_plate, color });
    const savedVehicle = yield newVehicle.save();
    res.status(201).json(savedVehicle);
}));
exports.getVehicleById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vehicle = yield vehicle_1.default.findById(req.params.id);
    if (!vehicle) {
        throw { statusCode: 404, message: 'Vehicle not found.' };
    }
    res.json(vehicle);
}));
exports.updateVehicle = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedVehicle = yield vehicle_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found.' };
    }
    res.json(updatedVehicle);
}));
exports.deleteVehicle = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedVehicle = yield vehicle_1.default.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
        throw { statusCode: 404, message: 'Vehicle not found.' };
    }
    res.json({ message: 'Vehicle deleted successfully' });
}));
