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
exports.deleteSchool = exports.updateSchool = exports.getSchoolById = exports.createSchool = exports.getAllSchools = void 0;
const school_1 = __importDefault(require("../models/school"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.getAllSchools = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schools = yield school_1.default.find();
    res.json(schools);
}));
exports.createSchool = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, phone_number, email } = req.body;
    if (!name || !address || !phone_number || !email) {
        throw { statusCode: 400, message: 'All fields are required.' };
    }
    const newSchool = new school_1.default({ name, address, phone_number, email });
    const savedSchool = yield newSchool.save();
    res.status(201).json(savedSchool);
}));
exports.getSchoolById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_1.default.findById(req.params.id);
    if (!school) {
        throw { statusCode: 404, message: 'School not found' };
    }
    res.json(school);
}));
exports.updateSchool = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedSchool = yield school_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedSchool) {
        throw { statusCode: 404, message: 'School not found' };
    }
    res.json(updatedSchool);
}));
exports.deleteSchool = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedSchool = yield school_1.default.findByIdAndDelete(req.params.id);
    if (!deletedSchool) {
        throw { statusCode: 404, message: 'School not found' };
    }
    res.json({ message: 'School deleted successfully' });
}));
