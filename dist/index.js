"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const pickupPerson_routes_1 = __importDefault(require("./routes/pickupPerson.routes"));
const pickupSchedule_routes_1 = __importDefault(require("./routes/pickupSchedule.routes"));
const exceptionPickup_routes_1 = __importDefault(require("./routes/exceptionPickup.routes"));
const school_routes_1 = __importDefault(require("./routes/school.routes"));
const studentPickupPerson_routes_1 = __importDefault(require("./routes/studentPickupPerson.routes"));
const userAuthRoutes_1 = __importDefault(require("./routes/userAuthRoutes"))
// Load environment variables from .env file
dotenv_1.default.config();
// Initialize Express
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Connect to MongoDB
(0, db_1.default)();
app.use('/vehicles', vehicle_routes_1.default);
app.use('/auth', auth_routes_1.default);
app.use('/students', student_routes_1.default);
app.use('/attendances', attendance_routes_1.default);
app.use('/pickup-persons', pickupPerson_routes_1.default);
app.use('/pickup-schedules', pickupSchedule_routes_1.default);
app.use('/exception-pickups', exceptionPickup_routes_1.default);
app.use('/schools', school_routes_1.default);
app.use('/student-pickup-persons', studentPickupPerson_routes_1.default);
app.use('/auth/user', userAuthRoutes_1.default);
// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the School Management API!');
});
// Error handling middleware
app.use(errorHandler_1.default);
// Auth routes
app.use('/auth', auth_routes_1.default);
// Example: POST /auth/signup, POST /auth/login
// Other existing routes, e.g.:
app.use('/students', student_routes_1.default);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
