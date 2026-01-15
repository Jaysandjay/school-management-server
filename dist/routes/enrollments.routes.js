"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnrollmentRouter = createEnrollmentRouter;
const express_1 = require("express");
function createEnrollmentRouter(repository) {
    const router = (0, express_1.Router)();
    //Enroll student
    router.post("/:id", async (req, res) => {
        try {
            const studentId = parseInt(req.params.id);
            const classId = req.body.classId;
            if (!classId) {
                return res.status(400).json({ error: "Error enrolling student, missing class ID" });
            }
            if (isNaN(classId)) {
                return res.status(400).json({ error: "Invalid class ID" });
            }
            await repository.enrollStudent(studentId, classId);
            console.log(`Student ${studentId} enrolled in class ${classId}`);
            return res.status(200).json({ message: `Enrolled student ${studentId} in class ${classId}` });
        }
        catch (err) {
            console.error("Error enrolling student", err);
            return res.status(500).json({ error: "Error enrolling student" });
        }
    });
    //Set Grade
    router.put("/:id", async (req, res) => {
        try {
            const studentId = parseInt(req.params.id);
            const classId = req.body.classId;
            const grade = req.body.grade;
            if (!classId || !grade) {
                return res.status(400).json({ error: "Error setting grade, missing required fields" });
            }
            if (typeof grade !== "number" || grade < 0 || grade > 100) {
                return res.status(400).json({ error: "Grade must be between 0 and 100" });
            }
            if (isNaN(classId)) {
                return res.status(400).json({ error: "Invalid class ID" });
            }
            const enrollment = { studentId, classId, grade };
            await repository.setGrade(enrollment);
            console.log(`Grade ${grade} set for student ${studentId}, class ${classId}`);
            return res.status(200).json({ message: `Set Grade ${grade} for student ${studentId} in class ${classId}` });
        }
        catch (err) {
            console.error("Error setting grade", err);
            return res.status(500).json({ error: "Error setting grade" });
        }
    });
    //Get enrollments by student
    router.get("/student/:id", async (req, res) => {
        try {
            const studentId = parseInt(req.params.id);
            const enrollments = await repository.getEnrollmentsByStudent(studentId);
            console.log(`Enrollments for student ${studentId}`, enrollments);
            return res.status(200).json(enrollments);
        }
        catch (err) {
            console.error("Error getting enrollments ", err);
            return res.status(500).json({ error: "Error getting enrollments" });
        }
    });
    //Get enrollments by class
    router.get("/class/:id", async (req, res) => {
        try {
            const classId = parseInt(req.params.id);
            const enrollments = await repository.getEnrollmentsByClass(classId);
            console.log(`Enrollments for class ${classId}`, enrollments);
            return res.status(200).json(enrollments);
        }
        catch (err) {
            console.error("Error getting enrollments", err);
            return res.status(500).json({ error: "Error getting enrollments" });
        }
    });
    //Unenroll Student
    router.delete("/:id", async (req, res) => {
        try {
            const studentId = parseInt(req.params.id);
            const classId = parseInt(req.body.classId);
            if (!classId) {
                return res.status(400).json({ error: "Error enrolling student, missing class ID" });
            }
            if (isNaN(classId)) {
                return res.status(400).json({ error: "Invalid class ID" });
            }
            await repository.unenrollStudent(studentId, classId);
            console.log(`Student ${studentId} unenrolled in class ${classId}`);
            return res.status(200).json({ message: `Unenrolled student ${studentId} from class ${classId}` });
        }
        catch (err) {
            console.error("Error unenrolling student", err);
            return res.status(500).json({ error: "Error unenrolling student" });
        }
    });
    return router;
}
