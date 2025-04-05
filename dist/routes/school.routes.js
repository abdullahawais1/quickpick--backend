"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const school_controller_1 = require("../controllers/school.controller");
const router = express_1.default.Router();
router.get('/', school_controller_1.getAllSchools);
router.post('/', school_controller_1.createSchool);
router.get('/:id', school_controller_1.getSchoolById);
router.put('/:id', school_controller_1.updateSchool);
router.delete('/:id', school_controller_1.deleteSchool);
exports.default = router;
