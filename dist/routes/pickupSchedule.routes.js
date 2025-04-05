"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pickupSchedule_controller_1 = require("../controllers/pickupSchedule.controller");
const router = express_1.default.Router();
router.get('/', pickupSchedule_controller_1.getAllPickupSchedules);
router.post('/', pickupSchedule_controller_1.createPickupSchedule);
router.get('/:id', pickupSchedule_controller_1.getPickupScheduleById);
router.put('/:id', pickupSchedule_controller_1.updatePickupSchedule);
router.delete('/:id', pickupSchedule_controller_1.deletePickupSchedule);
exports.default = router;
