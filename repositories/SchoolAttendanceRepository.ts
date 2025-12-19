import type {Attendance} from "../types/Attendance"
import { AttendanceStatus } from "../types/AttendanceStatus";
import {AttendanceRepository} from "./types/attendance.base.repository"
import { Pool } from "pg";

const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})

export class SchoolAttendanceRepository implements AttendanceRepository {
    async getAttendanceBySession(sessionId: number): Promise<Attendance[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM attendance WHERE session_id=$1',
                [sessionId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error getting attendance. Session ${sessionId} does not exist`)
            }
            console.log(`Attendance for session ${sessionId}`, res.rows)
            return res.rows
        }catch(err){
            console.error("Error getting attendance by session", err)
            throw err
        }finally{
            client.release()
        }
    }

    async getAttendanceByStudent(studentId: number, class_id: number): Promise<Attendance[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM attendance WHERE student_id=$1 AND class_id=$2',
                [studentId, class_id]
            )
            if(res.rowCount === 0){
                throw new Error(`Error getting attendance. Student ${studentId} or class ${class_id} does not exist`)
            }
            console.log(`Attendance for student ${studentId}, class ${class_id}`, res.rows)
            return res.rows
        }catch(err){
            console.error("Error getting attendance by student", err)
            throw err
        }finally{
            client.release()
        }
    }

    async markAttendance(attendance: Attendance): Promise<void> {
        const client = await pool.connect()
        try{
            await client.query('INSERT INTO attendance(student_id, session_id, status) VALUES($1, $2, $3)',
                [attendance.studentId, attendance.sessionId, attendance.status]
            )
            console.log(`Attendance Marked`, attendance)
        }catch(err){
            console.error("Error Marking attendance")
            throw err
        }finally{
            client.release()
        }
    }

    async updateAttendance(studentId: number, sessionId: number, status: AttendanceStatus): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('UPDATE attendance SET status=$1 WHERE student_id=$2 AND session_id=$3',
                [status, studentId, sessionId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error updating Attendace, student ${studentId} or session ${sessionId} Not Found`)
            }
            console.log(`Attendance for student ${studentId} and session ${sessionId} updated. Status: ${status}`)
        }catch(err){
            console.error(`Error updating attendance for student ${studentId} and session ${sessionId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async deleteAttendance(studentId: number, sessionId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM attendance WHERE student_id=$1 AND session_id=$2',
                [studentId, sessionId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error deleting, student ${studentId} or session${sessionId} does not exist`)
            }
            console.log(`Deleted attendance for student${studentId} and session ${sessionId}`)
        }catch(err){
            console.error(`Failed to delete attendance for student ${studentId} and session ${sessionId}`, err)
            throw err
        }finally{
            client.release()
        }
    }
}
