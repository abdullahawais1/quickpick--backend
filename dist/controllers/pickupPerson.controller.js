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
exports.deletePickupPerson = exports.updatePickupPerson = exports.createPickupPerson = exports.getPickupPersonById = exports.getAllPickupPersons = exports.clearStudents = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const pickupPerson_1 = __importDefault(require("../models/pickupPerson"));
const vehicle_1 = __importDefault(require("../models/vehicle")); // Assuming you have a Vehicle model
const student_1 = __importDefault(require("../models/student")); // Assuming you have a Student model
// ✅ Clear the students array for a specific PickupPerson
exports.clearStudents = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get the pickup person id from the URL params
    // Find the pickup person by their `id`
    const pickupPerson = yield pickupPerson_1.default.findOne({ id: Number(id) });
    // If the PickupPerson doesn't exist, return an error
    if (!pickupPerson) {
        res.status(404).json({ msg: "PickupPerson not found." });
        return;
    }
    // Update the PickupPerson to empty the students array
    pickupPerson.students = []; // Empty the students array
    // Save the updated PickupPerson document
    yield pickupPerson.save();
    // Return a success response
    res.status(200).json({ msg: "Students array cleared successfully.", pickupPerson });
}));
exports.getAllPickupPersons = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Find all pickup persons
    const pickupPersons = yield pickupPerson_1.default.find().select("-__v");
    // Manually populate students and vehicle details
    const populatedPickupPersons = yield Promise.all(pickupPersons.map((person) => __awaiter(void 0, void 0, void 0, function* () {
        // Manually populate students by querying Student with custom 'id'
        const students = yield student_1.default.find({ id: { $in: person.students } })
            .select("id name grade section")
            .lean(); // Return plain objects for easier manipulation
        // Manually populate the vehicle details if vehicle_id exists
        const vehicle = person.vehicle_id ? yield vehicle_1.default.findOne({ id: person.vehicle_id }).select("id model plate_number") : null;
        return Object.assign(Object.assign({}, person.toObject()), { students, vehicle }); // Merge student and vehicle data
    })));
    res.status(200).json(populatedPickupPersons); // Return the populated data
}));
// ✅ Get Pickup Person by ID (with Vehicle Details)
exports.getPickupPersonById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickupPerson = yield pickupPerson_1.default.findOne({ id: Number(req.params.id) });
    if (!pickupPerson) {
        res.status(404).json({ msg: "PickupPerson not found." });
        return;
    }
    const vehicle = pickupPerson.vehicle_id ? yield vehicle_1.default.findOne({ id: pickupPerson.vehicle_id }).select("id model plate_number") : null;
    res.status(200).json(Object.assign(Object.assign({}, pickupPerson.toObject()), { vehicle }));
}));
// ✅ Create a new PickupPerson
exports.createPickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone_number, email, cnic, vehicle_id } = req.body;
    if (!name || !phone_number || !email || !cnic) {
        res.status(400).json({ msg: "Name, phone_number, email, and cnic are required." });
        return;
    }
    // Ensure CNIC and vehicle_id (if provided) are numbers
    const cnicNumber = Number(cnic);
    const vehicleId = vehicle_id ? Number(vehicle_id) : undefined;
    // Check if CNIC or Email already exists
    const existingPickupPerson = yield pickupPerson_1.default.findOne({ $or: [{ cnic: cnicNumber }, { email }] });
    if (existingPickupPerson) {
        res.status(400).json({ msg: "CNIC or Email already exists." });
        return;
    }
    // If vehicle_id is provided, check if the vehicle exists
    if (vehicleId) {
        const vehicleExists = yield vehicle_1.default.findOne({ id: vehicleId });
        if (!vehicleExists) {
            res.status(404).json({ msg: "Vehicle not found." });
            return;
        }
    }
    // Generate unique ID
    const lastPickupPerson = yield pickupPerson_1.default.find().select("id").sort("-id").limit(1);
    const newPickupPersonId = lastPickupPerson.length ? lastPickupPerson[0].id + 1 : 1;
    const newPickupPerson = new pickupPerson_1.default({
        id: newPickupPersonId,
        name,
        phone_number,
        email,
        cnic: cnicNumber,
        vehicle_id: vehicleId,
    });
    yield newPickupPerson.save();
    res.status(201).json({ msg: "PickupPerson created successfully", pickupPerson: newPickupPerson });
}));
// ✅ Update PickupPerson by ID (Ensure Vehicle Exists)
exports.updatePickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cnic, vehicle_id } = req.body;
    // Ensure CNIC and vehicle_id (if provided) are numbers
    if (cnic !== undefined) {
        req.body.cnic = Number(cnic);
    }
    if (vehicle_id !== undefined) {
        req.body.vehicle_id = Number(vehicle_id);
    }
    // If vehicle_id is provided, check if the vehicle exists
    if (vehicle_id !== undefined) {
        const vehicleExists = yield vehicle_1.default.findOne({ id: vehicle_id });
        if (!vehicleExists) {
            res.status(404).json({ msg: "Vehicle not found." });
            return;
        }
    }
    const updatedPickupPerson = yield pickupPerson_1.default.findOneAndUpdate({ id: Number(req.params.id) }, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedPickupPerson) {
        res.status(404).json({ msg: "PickupPerson not found." });
        return;
    }
    const vehicle = updatedPickupPerson.vehicle_id
        ? yield vehicle_1.default.findOne({ id: updatedPickupPerson.vehicle_id }).select("id model plate_number")
        : null;
    res.status(200).json(Object.assign(Object.assign({}, updatedPickupPerson.toObject()), { vehicle }));
}));
// ✅ Delete PickupPerson by ID
exports.deletePickupPerson = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedPickupPerson = yield pickupPerson_1.default.findOneAndDelete({ id: Number(req.params.id) });
    if (!deletedPickupPerson) {
        res.status(404).json({ msg: "PickupPerson not found." });
        return;
    }
    res.status(200).json({ msg: "PickupPerson deleted successfully" });
}));
