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
exports.getChildren = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // Changed from bcrypt to bcryptjs
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const pickupPerson_1 = __importDefault(require("../models/pickupPerson"));
const appuser_1 = __importDefault(require("../models/appuser"));
const student_1 = __importDefault(require("../models/student"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';
// ✅ Signup Controller
exports.signup = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone_number, cnic, password } = req.body;
    const existingUser = yield appuser_1.default.findOne({ email, cnic, phone_number });
    if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    const pickupPerson = yield pickupPerson_1.default.findOne({ email, cnic, phone_number });
    if (!pickupPerson) {
        res.status(404).json({ message: 'Pickup person not found' });
        return;
    }
    // Hash the password using bcryptjs
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const newUser = new appuser_1.default({ name, email, phone_number, cnic, password: hashedPassword });
    yield newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
}));
// ✅ Login Controller
exports.login = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield appuser_1.default.findOne({ email }).select('+password');
    if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    // Compare password using bcryptjs
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    // Token includes userId and email for identification
    const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
    });
    res.json({ token });
}));
// ✅ Get Children of the Logged-in User (Pickup Person)
exports.getChildren = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Comes from JWT middleware
    if (!user || !user.email) {
        res.status(401).json({ message: 'Unauthorized: No user info found' });
        return;
    }
    // Find the pickup person using the user's email
    const pickupPerson = yield pickupPerson_1.default.findOne({ email: user.email });
    if (!pickupPerson) {
        res.status(404).json({ message: 'Pickup person not found' });
        return;
    }
    // Fetch students associated with the pickup person by `pickup_person` array
    const students = yield student_1.default.find({ pickup_person: pickupPerson.id }).select('id name grade section');
    res.status(200).json({ children: students });
}));
