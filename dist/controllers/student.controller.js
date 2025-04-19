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
exports.getPickupPersonChildren = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentsByGradeSection = exports.getStudentById = exports.getAllStudents = exports.addPickupPersonToStudent = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const student_1 = __importDefault(require("../models/student"));
const pickupPerson_1 = __importDefault(require("../models/pickupPerson"));
// ✅ Add a pickup person to an existing student and simultaneously add the student to the PickupPerson's students array
exports.addPickupPersonToStudent = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = Number(req.params.id);
    const newPickupPersonId = Number(req.body.pickup_person_id);
    if (!newPickupPersonId) {
        res.status(400).json({ msg: "pickup_person_id is required in request body." });
        return;
    }
    // Check if student exists
    const student = yield student_1.default.findOne({ id: studentId });
    if (!student) {
        res.status(404).json({ msg: "Student not found." });
        return;
    }
    // Check if pickup person exists
    const pickupPerson = yield pickupPerson_1.default.findOne({ id: newPickupPersonId });
    if (!pickupPerson) {
        res.status(404).json({ msg: "Pickup person not found." });
        return;
    }
    // Add pickup person to the student pickup_person array if not already present
    const updatedStudent = yield student_1.default.findOneAndUpdate({ id: studentId }, { $addToSet: { pickup_person: newPickupPersonId } }, // Add pickup person ID to the student's pickup_person array
    { new: true });
    // Add student to the PickupPerson's students array if not already present
    yield pickupPerson_1.default.findOneAndUpdate({ id: newPickupPersonId }, { $addToSet: { students: studentId } }, // Add student ID to the pickup person's students array
    { new: true });
    res.status(200).json({
        msg: "Pickup person added successfully to the student, and student added to the PickupPerson's students list.",
        student: updatedStudent,
    });
}));
// ✅ Get all students (With PickupPerson Details)
exports.getAllStudents = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const students = yield student_1.default.find();
    const populatedStudents = yield Promise.all(students.map((student) => __awaiter(void 0, void 0, void 0, function* () {
        const pickupPersons = yield pickupPerson_1.default.find({ id: { $in: student.pickup_person } })
            .select("id name phone_number email");
        return Object.assign(Object.assign({}, student.toObject()), { pickup_person: pickupPersons });
    })));
    res.status(200).json(populatedStudents);
}));
// ✅ Get student by unique numeric ID (With PickupPerson Details)
exports.getStudentById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield student_1.default.findOne({ id: Number(req.params.id) });
    if (!student) {
        res.status(404).json({ msg: "Student not found." });
        return;
    }
    const pickupPersons = yield pickupPerson_1.default.find({ id: { $in: student.pickup_person } })
        .select("id name phone_number email");
    res.status(200).json(Object.assign(Object.assign({}, student.toObject()), { pickup_person: pickupPersons }));
}));
// ✅ Get students by Grade & Section (With PickupPerson Details)
exports.getStudentsByGradeSection = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { grade, section } = req.query;
    if (!grade || !section) {
        res.status(400).json({ msg: "Grade and Section are required." });
        return;
    }
    const students = yield student_1.default.find({ grade, section });
    if (!students.length) {
        res.status(404).json({ msg: "No students found for this Grade & Section." });
        return;
    }
    const populatedStudents = yield Promise.all(students.map((student) => __awaiter(void 0, void 0, void 0, function* () {
        const pickupPersons = yield pickupPerson_1.default.find({ id: { $in: student.pickup_person } })
            .select("id name phone_number email");
        return Object.assign(Object.assign({}, student.toObject()), { pickup_person: pickupPersons });
    })));
    res.status(200).json(populatedStudents);
}));
// ✅ Create a new Student and simultaneously update PickupPerson's students array
exports.createStudent = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, grade, section, pickup_person } = req.body;
    if (!name || !grade || !section || !pickup_person || pickup_person.length === 0) {
        res.status(400).json({ msg: "Name, grade, section, and pickup_person are required." });
        return;
    }
    // Create the new student with pickup_person as an array of IDs
    const newStudent = new student_1.default({
        id: req.body.id, // Use the ID from the request body (not Date.now() to ensure you are passing the correct ID)
        name,
        grade,
        section,
        pickup_person,
    });
    // Save the student
    yield newStudent.save();
    // Add student to each PickupPerson's students array if they are not already in it
    yield Promise.all(pickup_person.map((pickupPersonId) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if PickupPerson exists
        const pickupPerson = yield pickupPerson_1.default.findOne({ id: pickupPersonId });
        if (pickupPerson) {
            // Add the student to the PickupPerson's students array (if not already present)
            yield pickupPerson_1.default.findOneAndUpdate({ id: pickupPersonId }, { $addToSet: { students: newStudent.id } }, // Add student ID to the pickup person's students array
            { new: true });
        }
    })));
    // Return the newly created student with pickup_person as IDs only (no population)
    res.status(201).json({
        msg: "Student created successfully, and pickup persons updated.",
        student: {
            id: newStudent.id,
            name: newStudent.name,
            grade: newStudent.grade,
            section: newStudent.section,
            pickup_person: newStudent.pickup_person, // Return only the IDs of the pickup persons
        },
    });
}));
// ✅ Update student
exports.updateStudent = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updateData = req.body;
    if (updateData.pickup_person) {
        if (!Array.isArray(updateData.pickup_person)) {
            res.status(400).json({ msg: "pickup_person must be an array." });
            return;
        }
        const existingPersons = yield pickupPerson_1.default.find({ id: { $in: updateData.pickup_person } });
        if (existingPersons.length !== updateData.pickup_person.length) {
            res.status(404).json({ msg: "One or more pickup persons not found." });
            return;
        }
    }
    const updatedStudent = yield student_1.default.findOneAndUpdate({ id: Number(req.params.id) }, updateData, {
        new: true,
        runValidators: true,
    });
    if (!updatedStudent) {
        res.status(404).json({ msg: "Student not found." });
        return;
    }
    const pickupPersons = yield pickupPerson_1.default.find({ id: { $in: updatedStudent.pickup_person } })
        .select("id name phone_number email");
    res.status(200).json(Object.assign(Object.assign({}, updatedStudent.toObject()), { pickup_person: pickupPersons }));
}));
// ✅ Delete student
exports.deleteStudent = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield student_1.default.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) {
        res.status(404).json({ msg: "Student not found." });
        return;
    }
    res.status(200).json({ msg: "Student deleted successfully." });
}));
// ✅ Get children of a PickupPerson
exports.getPickupPersonChildren = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId); // assuming you pass userId in URL params
    const children = yield student_1.default.find({ pickup_person: userId });
    const populated = yield Promise.all(children.map((student) => __awaiter(void 0, void 0, void 0, function* () {
        const pickupPersons = yield pickupPerson_1.default.find({ id: { $in: student.pickup_person } })
            .select("id name phone_number email");
        return Object.assign(Object.assign({}, student.toObject()), { pickup_person: pickupPersons });
    })));
    res.status(200).json(populated);
}));
