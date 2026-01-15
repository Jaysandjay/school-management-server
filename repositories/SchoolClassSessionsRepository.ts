import type { ClassSession } from "../types/ClassSession";
import { ClassSessionRepository } from "./types/classSessions.base.repository";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({connectionString: process.env.CONNECTION_STRING})

export class SchoolClassSessionsRepository implements ClassSessionRepository {

    async scheduleSession(session: ClassSession): Promise<void> {
        const client = await pool.connect()

        try{
            await client.query('INSERT INTO class_sessions(class_id, day_of_week, start_time, end_time) VALUES($1, $2, $3, $4)',
                [session.classId, session.dayOfWeek, session.startTime, session.endTime]
            )
        }catch(err){
            console.error("Error creating class session")
            throw err
        }finally{
            client.release()
        }
    }

    async getSessionsByClass(classId: number): Promise<ClassSession[]> {
        const client = await pool.connect()

        try{
            const res = await client.query('SELECT * FROM class_sessions WHERE class_id = $1',
                [classId]
            )
            return res.rows
        }catch(err){
            console.error(`Error Getting Class Session with ID ${classId} `)
            throw err
        }finally{
            client.release()
        }
    }

    async updateSession(sessionId: number, sessionInfo: ClassSession): Promise<void> {
        const client = await pool.connect()

        try{
            const res = await client.query('UPDATE class_sessions SET day_of_week=$1, start_time=$2, end_time=$3 WHERE session_id=$4 RETURNING *',
                [sessionInfo.dayOfWeek, sessionInfo.startTime, sessionInfo.endTime, sessionId]
           )
           if(res.rowCount === 0){
            throw new Error(`Error updating session ${sessionId}, Session not found`)
           }
           console.log(`Session ${sessionId} updated: `, sessionInfo)
        }catch(err){
            console.error(`Error updating session ${sessionId}`)
            throw err
        }finally{
            client.release()
        }
    }
}
