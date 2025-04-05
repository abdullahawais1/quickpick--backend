"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = express_1.default.Router();
router.get('/', attendance_controller_1.getAllAttendances);
router.post('/', attendance_controller_1.createAttendance);
router.get('/:id', attendance_controller_1.getAttendanceById);
router.put('/:id', attendance_controller_1.updateAttendance);
router.delete('/:id', attendance_controller_1.deleteAttendance);
exports.default = router;
