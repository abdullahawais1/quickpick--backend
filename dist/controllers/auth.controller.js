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
exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';
// POST /signup
exports.signup = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !password) {
        throw { statusCode: 400, message: 'Username and password are required.' };
    }
    // 2. Check if user already exists
    const existingUser = yield user_1.default.findOne({ username });
    if (existingUser) {
        throw { statusCode: 409, message: 'Username is already taken.' };
    }
    // 3. Hash the password
    const saltRounds = 10;
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
    // 4. Create the user
    const newUser = new user_1.default({
        username,
        email,
        password: hashedPassword,
    });
    yield newUser.save();
    // 5. Generate token
    const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
        message: 'Signup successful',
        user: { username: newUser.username, email: newUser.email },
        token,
    });
}));
// POST /login
exports.login = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // 1. Basic validation
    if (!username || !password) {
        throw { statusCode: 400, message: 'Username and password are required.' };
    }
    // 2. Find user by username
    const user = yield user_1.default.findOne({ username });
    if (!user) {
        throw { statusCode: 401, message: 'Invalid username or password.' };
    }
    // 3. Compare passwords
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw { statusCode: 401, message: 'Invalid username or password.' };
    }
    // 4. Generate JWT
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
        message: 'Login successful',
        user: { username: user.username, email: user.email },
        token,
    });
}));
