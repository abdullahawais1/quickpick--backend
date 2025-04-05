"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentPickupPerson_controller_1 = require("../controllers/studentPickupPerson.controller");
const router = express_1.default.Router();
router.get('/', studentPickupPerson_controller_1.getAllStudentPickupPersons);
router.post('/', studentPickupPerson_controller_1.createStudentPickupPerson);
router.get('/:id', studentPickupPerson_controller_1.getStudentPickupPersonById);
router.put('/:id', studentPickupPerson_controller_1.updateStudentPickupPerson);
router.delete('/:id', studentPickupPerson_controller_1.deleteStudentPickupPerson);
exports.default = router;
