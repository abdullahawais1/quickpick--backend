"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.get('/', authMiddleware_1.default, vehicle_controller_1.getAllVehicles);
router.post('/', authMiddleware_1.default, vehicle_controller_1.createVehicle);
router.get('/:id', authMiddleware_1.default, vehicle_controller_1.getVehicleById);
router.put('/:id', authMiddleware_1.default, vehicle_controller_1.updateVehicle);
router.delete('/:id', authMiddleware_1.default, vehicle_controller_1.deleteVehicle);
exports.default = router;
