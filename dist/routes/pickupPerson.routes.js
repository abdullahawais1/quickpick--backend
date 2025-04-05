"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pickupPerson_controller_1 = require("../controllers/pickupPerson.controller");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Apply authMiddleware to routes that need protection
router.get('/', authMiddleware_1.default, pickupPerson_controller_1.getAllPickupPersons);
router.post('/', authMiddleware_1.default, pickupPerson_controller_1.createPickupPerson);
router.get('/:id', authMiddleware_1.default, pickupPerson_controller_1.getPickupPersonById);
router.put('/:id', authMiddleware_1.default, pickupPerson_controller_1.updatePickupPerson);
router.delete('/:id', authMiddleware_1.default, pickupPerson_controller_1.deletePickupPerson);
exports.default = router;
