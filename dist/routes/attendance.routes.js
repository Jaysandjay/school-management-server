"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttendanceRouter = createAttendanceRouter;
const express_1 = require("express");
function createAttendanceRouter(repository) {
    const router = (0, express_1.Router)();
    const ATTENDANCE_STATUS = ["Present", "Absent", "Late"];
    //Get attendance by session
    router.get("/session/:id", async (req, res) => {
        try {
            const sessionId = parseInt(req.params.id);
            const attendance = await repository.getAttendanceBySession(sessionId);
            console.log("Attendance", attendance);
            return res.status(200).json(attendance);
        }
        catch (err) {
            console.error("Error getting attendance by seesion", err);
            return res.status(500).json({ error: "Error getting attendance by seesion" });
        }
    });
    //Get attendance by student
    router.get("/student/:id", async (req, res) => {
        try {
            const studentId = parseInt(req.params.id);
            const classId = parseInt(req.body);
            if (isNaN(classId)) {
                return res.status(400).json({ error: "Invalid class ID" });
            }
            const attendance = await repository.getAttendanceByStudent(studentId, classId);
            console.log("Attendance", attendance);
            return res.status(200).json(attendance);
        }
        catch (err) {
            console.error("Error getting attendance by student ", err);
            return res.status(500).json({ error: "Error getting attendance by student" });
        }
    });
    //Mark attendacne
    router.post("/", async (req, res) => {
        try {
            const { studentId, sessionId, status } = req.body;
            if (!studentId || !sessionId || !status) {
                return res.status(400).json({ error: "Error marking attendance, missing required fields" });
            }
            if (isNaN(studentId) || isNaN(sessionId)) {
                return res.status(400).json({ error: "Invalid ID type" });
            }
            if (!ATTENDANCE_STATUS.includes(status)) {
                return res.status(400).json({ error: "Error marking attendance, invalid status" });
            }
            const attendance = { studentId, sessionId, status };
            await repository.markAttendance(attendance);
            console.log("Attendance marked", attendance);
            return res.status(200).json(attendance);
        }
        catch (err) {
            console.error("Error marking attendance", err);
            return res.status(500).json({ error: "Error marking attendance" });
        }
    });
    //Update attendance
    router.put("/session/:id", async (req, res) => {
        try {
            const session_id = parseInt(req.params.id);
            const { studentId, status } = req.body;
            if (isNaN(studentId)) {
                return res.status(400).json({ error: "Invalid student ID" });
            }
            if (!ATTENDANCE_STATUS.includes(status)) {
                return res.status(400).json({ error: "Error marking attendance, invalid status" });
            }
            await repository.updateAttendance(studentId, session_id, status);
            console.log(`Updated Attendance`, studentId, session_id, status);
            return res.status(200).json({ message: `Updated attendance session ${session_id}, student ${studentId}, status: ${status}` });
        }
        catch (err) {
            console.error("Error updating attendance", err);
            return res.status(500).json({ error: "Error updating attendance" });
        }
    });
    //Delete attendance
    router.delete("/session/:id", async (req, res) => {
        try {
            const sessionId = parseInt(req.params.id);
            const studentId = parseInt(req.body.studentId);
            if (isNaN(studentId)) {
                return res.status(400).json({ error: "Invalid student ID" });
            }
            await repository.deleteAttendance(studentId, sessionId);
            console.log(`Deleted attendance for student ${studentId}, session ${sessionId}`);
            return res.send(200).json({ message: `Deleted attendance for student ${studentId}, session ${sessionId}` });
        }
        catch (err) {
            console.error("Error deleting attendance", err);
            return res.status(500).json({ error: "Error deleting attendance" });
        }
    });
    return router;
}
