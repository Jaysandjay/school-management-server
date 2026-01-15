"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeacherRouter = createTeacherRouter;
const express_1 = require("express");
function createTeacherRouter(repository) {
    const router = (0, express_1.Router)();
    //Get Teachers
    router.get("/", async (req, res) => {
        try {
            const teachers = await repository.getTeachers();
            return res.status(200).json(teachers);
        }
        catch (err) {
            console.error("Error fetching teachers", err);
            return res.status(500).json({ error: "Error fetching teachers" });
        }
    });
    //Get Teacher by ID
    router.get("/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const teacher = await repository.getTeacher(id);
            return res.status(200).json(teacher);
        }
        catch (err) {
            console.error("Error getting teacher", err);
            return res.status(500).json({ error: "Error getting teacher" });
        }
    });
    //Create Teacher
    router.post("/", async (req, res) => {
        try {
            const { firstName, lastName, email, phone } = req.body;
            const teacher = { firstName, lastName, email, phone };
            if (!firstName || !lastName || !email || !phone) {
                console.error("Cant Create Teacher. Missing Required Fields");
                return res.status(400).json({ error: "Missing Teacher Required Fields" });
            }
            await repository.addTeacher(teacher);
            res.status(200).json(teacher);
        }
        catch (err) {
            console.error("Error adding teacher", err);
            return res.status(500).json({ error: "Error adding teacjer" });
        }
    });
    //Update Teacher
    router.put("/:id", async (req, res) => {
        try {
            const teacherId = parseInt(req.params.id);
            const { firstName, lastName, email, phone } = req.body;
            const updatedTeacherInfo = { firstName, lastName, email, phone };
            await repository.updateTeacher(teacherId, updatedTeacherInfo);
            const teacher = {
                teacher_id: teacherId,
                ...updatedTeacherInfo
            };
            res.status(200).json(teacher);
        }
        catch (err) {
            console.error("Error updating teacher", err);
            return res.status(500).json({ error: "Error updating teacher" });
        }
    });
    //Delete Teacher
    router.delete("/:id", async (req, res) => {
        try {
            const teacherId = parseInt(req.params.id);
            await repository.deleteTeacher(teacherId);
            res.status(200).json({ message: `Teacher ${teacherId} deleted` });
        }
        catch (err) {
            console.error("Error deleting teacher", err);
            return res.status(500).json({ error: "Error deleting teacher" });
        }
    });
    //Get teacher classes
    router.get("/:id/classes", async (req, res) => {
        try {
            const teacherId = parseInt(req.params.id);
            const classes = await repository.getTeacherClasses(teacherId);
            return res.status(200).json(classes);
        }
        catch (err) {
            console.error(`Failed to get teachers classes`, err);
            return res.status(500).json({ error: "Error getting teachers classes" });
        }
    });
    //Get teacher address
    router.get("/:id/address", async (req, res) => {
        try {
            const teacherId = parseInt(req.params.id);
            const address = await repository.getTeacherAddress(teacherId);
            return res.status(200).json(address);
        }
        catch (err) {
            console.error(`Failed to update address`, err);
            return res.status(500).json({ error: "Error updating address" });
        }
    });
    //Add Teacher Address
    router.post("/:id/address", async (req, res) => {
        try {
            const teacherId = parseInt(req.params.id);
            await repository.addTeacherAddress(teacherId, req.body);
            return res.status(200).json({ message: `Address Added` });
        }
        catch (err) {
            console.error("Error creating address", err);
            return res.status(500).json({ error: "Error ceating address" });
        }
    });
    //Update Teacher Address
    router.put("/:id/address", async (req, res) => {
        try {
            const teacherId = parseInt(req.params.id);
            await repository.updateTeacherAddress(teacherId, req.body);
            return res.status(200).json({ message: "Address Updated" });
        }
        catch (err) {
            console.error(`Failed to update address`, err);
            return res.status(500).json({ error: "Error update address" });
        }
    });
    return router;
}
