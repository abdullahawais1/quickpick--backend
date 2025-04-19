"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const VehicleSchema = new mongoose_1.Schema({
    id: { type: Number, unique: true, required: true }, // Unique number as primary key
    name: { type: String, required: true },
    num_plate: { type: String, required: true, unique: true },
    color: { type: String, required: true },
}, { timestamps: true });
// Ensure `id` is the primary key instead of MongoDB's default `_id`
VehicleSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret.id; // Explicitly include `id`
        delete ret._id; // Remove MongoDB's default `_id`
        delete ret.__v;
        return ret;
    },
});
// Ensure `id` is indexed uniquely
VehicleSchema.index({ id: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Vehicle", VehicleSchema);
