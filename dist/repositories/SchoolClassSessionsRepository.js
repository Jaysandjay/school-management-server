"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolClassSessionsRepository = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: 'postgresql://admin:admin123@localhost:5432/school_db' });
class SchoolClassSessionsRepository {
    async scheduleSession(session) {
        const client = await pool.connect();
        try {
            await client.query('INSERT INTO class_sessions(class_id, day_of_week, start_time, end_time) VALUES($1, $2, $3, $4)', [session.classId, session.dayOfWeek, session.startTime, session.endTime]);
        }
        catch (err) {
            console.error("Error creating class session");
            throw err;
        }
        finally {
            client.release();
        }
    }
    async getSessionsByClass(classId) {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM class_sessions WHERE class_id = $1', [classId]);
            return res.rows;
        }
        catch (err) {
            console.error(`Error Getting Class Session with ID ${classId} `);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async updateSession(sessionId, sessionInfo) {
        const client = await pool.connect();
        try {
            const res = await client.query('UPDATE class_sessions SET day_of_week=$1, start_time=$2, end_time=$3 WHERE session_id=$4 RETURNING *', [sessionInfo.dayOfWeek, sessionInfo.startTime, sessionInfo.endTime, sessionId]);
            if (res.rowCount === 0) {
                throw new Error(`Error updating session ${sessionId}, Session not found`);
            }
            console.log(`Session ${sessionId} updated: `, sessionInfo);
        }
        catch (err) {
            console.error(`Error updating session ${sessionId}`);
            throw err;
        }
        finally {
            client.release();
        }
    }
}
exports.SchoolClassSessionsRepository = SchoolClassSessionsRepository;
