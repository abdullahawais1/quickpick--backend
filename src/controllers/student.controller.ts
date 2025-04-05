import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Student from "../models/student";
import PickupPerson from "../models/pickupPerson";

// ✅ Add a pickup person to an existing student and simultaneously add the student to the PickupPerson's students array
export const addPickupPersonToStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const studentId = Number(req.params.id);
  const newPickupPersonId = Number(req.body.pickup_person_id);

  if (!newPickupPersonId) {
    res.status(400).json({ msg: "pickup_person_id is required in request body." });
    return;
  }

  // Check if student exists
  const student = await Student.findOne({ id: studentId });
  if (!student) {
    res.status(404).json({ msg: "Student not found." });
    return;
  }

  // Check if pickup person exists
  const pickupPerson = await PickupPerson.findOne({ id: newPickupPersonId });
  if (!pickupPerson) {
    res.status(404).json({ msg: "Pickup person not found." });
    return;
  }

  // Add pickup person to the student pickup_person array if not already present
  const updatedStudent = await Student.findOneAndUpdate(
    { id: studentId },
    { $addToSet: { pickup_person: newPickupPersonId } }, // Add pickup person ID to the student's pickup_person array
    { new: true }
  );

  // Add student to the PickupPerson's students array if not already present
  await PickupPerson.findOneAndUpdate(
    { id: newPickupPersonId },
    { $addToSet: { students: studentId } }, // Add student ID to the pickup person's students array
    { new: true }
  );

  res.status(200).json({
    msg: "Pickup person added successfully to the student, and student added to the PickupPerson's students list.",
    student: updatedStudent,
  });
});

// ✅ Get all students (With PickupPerson Details)
export const getAllStudents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const students = await Student.find();

  const populatedStudents = await Promise.all(
    students.map(async (student) => {
      const pickupPersons = await PickupPerson.find({ id: { $in: student.pickup_person } })
        .select("id name phone_number email");
      return { ...student.toObject(), pickup_person: pickupPersons };
    })
  );

  res.status(200).json(populatedStudents);
});

// ✅ Get student by unique numeric ID (With PickupPerson Details)
export const getStudentById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const student = await Student.findOne({ id: Number(req.params.id) });

  if (!student) {
    res.status(404).json({ msg: "Student not found." });
    return;
  }

  const pickupPersons = await PickupPerson.find({ id: { $in: student.pickup_person } })
    .select("id name phone_number email");

  res.status(200).json({ ...student.toObject(), pickup_person: pickupPersons });
});

// ✅ Get students by Grade & Section (With PickupPerson Details)
export const getStudentsByGradeSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { grade, section } = req.query;

  if (!grade || !section) {
    res.status(400).json({ msg: "Grade and Section are required." });
    return;
  }

  const students = await Student.find({ grade, section });

  if (!students.length) {
    res.status(404).json({ msg: "No students found for this Grade & Section." });
    return;
  }

  const populatedStudents = await Promise.all(
    students.map(async (student) => {
      const pickupPersons = await PickupPerson.find({ id: { $in: student.pickup_person } })
        .select("id name phone_number email");
      return { ...student.toObject(), pickup_person: pickupPersons };
    })
  );

  res.status(200).json(populatedStudents);
});

// ✅ Create a new Student and simultaneously update PickupPerson's students array
export const createStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, grade, section, pickup_person } = req.body;

  if (!name || !grade || !section || !pickup_person || pickup_person.length === 0) {
    res.status(400).json({ msg: "Name, grade, section, and pickup_person are required." });
    return;
  }

  // Create the new student with pickup_person as an array of IDs
  const newStudent = new Student({
    id: req.body.id, // Use the ID from the request body (not Date.now() to ensure you are passing the correct ID)
    name,
    grade,
    section,
    pickup_person,
  });

  // Save the student
  await newStudent.save();

  // Add student to each PickupPerson's students array if they are not already in it
  await Promise.all(
    pickup_person.map(async (pickupPersonId: number) => {
      // Check if PickupPerson exists
      const pickupPerson = await PickupPerson.findOne({ id: pickupPersonId });
      if (pickupPerson) {
        // Add the student to the PickupPerson's students array (if not already present)
        await PickupPerson.findOneAndUpdate(
          { id: pickupPersonId },
          { $addToSet: { students: newStudent.id } }, // Add student ID to the pickup person's students array
          { new: true }
        );
      }
    })
  );

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
});


// ✅ Update student
export const updateStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const updateData = req.body;

  if (updateData.pickup_person) {
    if (!Array.isArray(updateData.pickup_person)) {
      res.status(400).json({ msg: "pickup_person must be an array." });
      return;
    }

    const existingPersons = await PickupPerson.find({ id: { $in: updateData.pickup_person } });
    if (existingPersons.length !== updateData.pickup_person.length) {
      res.status(404).json({ msg: "One or more pickup persons not found." });
      return;
    }
  }

  const updatedStudent = await Student.findOneAndUpdate({ id: Number(req.params.id) }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedStudent) {
    res.status(404).json({ msg: "Student not found." });
    return;
  }

  const pickupPersons = await PickupPerson.find({ id: { $in: updatedStudent.pickup_person } })
    .select("id name phone_number email");

  res.status(200).json({ ...updatedStudent.toObject(), pickup_person: pickupPersons });
});

// ✅ Delete student
export const deleteStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const deleted = await Student.findOneAndDelete({ id: Number(req.params.id) });

  if (!deleted) {
    res.status(404).json({ msg: "Student not found." });
    return;
  }

  res.status(200).json({ msg: "Student deleted successfully." });
});

// ✅ Get children of a PickupPerson
export const getPickupPersonChildren = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.userId);  // assuming you pass userId in URL params
  
  const children = await Student.find({ pickup_person: userId });

  const populated = await Promise.all(
    children.map(async (student) => {
      const pickupPersons = await PickupPerson.find({ id: { $in: student.pickup_person } })
        .select("id name phone_number email");
      return { ...student.toObject(), pickup_person: pickupPersons };
    })
  );

  res.status(200).json(populated);
});
