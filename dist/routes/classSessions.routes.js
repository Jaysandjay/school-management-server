"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClassSessionRouter = createClassSessionRouter;
const express_1 = require("express");
function createClassSessionRouter(repository) {
    const router = (0, express_1.Router)();
    const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    //Get Sessions by class
    router.get("/class/:id", async (req, res) => {
        try {
            const classId = parseInt(req.params.id);
            const sessions = await repository.getSessionsByClass(classId);
            console.log("Sessions:", sessions);
            return res.status(200).json(sessions);
        }
        catch (err) {
            console.error("Error getting session", err);
            return res.status(500).json({ error: "Error getting session" });
        }
    });
    //Schedule Session
    router.post('/class/:id', async (req, res) => {
        try {
            const classId = parseInt(req.params.id);
            const { dayOfWeek, startTime, endTime } = req.body;
            if (!dayOfWeek || !startTime || !endTime) {
                return res.status(400).json({ error: "Error scheduling session, Missing required fields" });
            }
            if (!DAYS_OF_WEEK.includes(dayOfWeek)) {
                return res.status(400).json({ error: "Error scheduling session, invalid input for day of week" });
            }
            const session = { classId, dayOfWeek, startTime, endTime };
            repository.scheduleSession(session);
            return res.status(200).json(session);
        }
        catch (err) {
            console.error("Error scheduling session", err);
            return res.status(500).json({ error: "Error scheduling session" });
        }
    });
    //Update Session
    router.put('/:id', async (req, res) => {
        try {
            const sessionId = parseInt(req.params.id);
            const { classId, dayOfWeek, startTime, endTime } = req.body;
            if (!classId || !dayOfWeek || !startTime || !endTime) {
                return res.status(400).json({ error: "Error scheduling session, Missing required fields" });
            }
            if (!DAYS_OF_WEEK.includes(dayOfWeek)) {
                return res.status(400).json({ error: "Error scheduling session, invalid input for day of week" });
            }
            const sessionInfo = { classId, dayOfWeek, startTime, endTime };
            repository.updateSession(sessionId, sessionInfo);
            return res.status(200).json({ message: `Session ${sessionId} updated` });
        }
        catch (err) {
            console.error("Error updating session", err);
            return res.status(500).json({ error: "Error updating session" });
        }
    });
    return router;
}
