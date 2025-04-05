"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const exceptionPickup_controller_1 = require("../controllers/exceptionPickup.controller");
const router = express_1.default.Router();
router.get('/', exceptionPickup_controller_1.getAllExceptionPickups);
router.post('/', exceptionPickup_controller_1.createExceptionPickup);
router.get('/:id', exceptionPickup_controller_1.getExceptionPickupById);
router.put('/:id', exceptionPickup_controller_1.updateExceptionPickup);
router.delete('/:id', exceptionPickup_controller_1.deleteExceptionPickup);
exports.default = router;
