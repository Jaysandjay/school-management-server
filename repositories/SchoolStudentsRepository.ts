import type { Student } from "../types/Student";
import { StudentRepository } from "./types/students.base.repository";
import { Pool } from "pg";

const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})

export class SchoolStudentsRepository implements StudentRepository {
    async getStudent(studentId: number): Promise<Student> {
        const client = await pool.connect()
        
        try{
            const res = await client.query('SELECT * FROM students WHERE student_id = $1',
                [studentId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error getting student, Student id ${studentId} Does not Exist`)
            }
            console.log(res.rows[0])
            return res.rows[0]
        }catch(err){
            console.error('Error getting Student', err)
            throw err
        }finally{
            client.release()
        }
    }
    
    async addStudent(studentInfo: Student): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query('INSERT INTO students(first_name, last_name, date_of_birth, grade_level) VALUES($1, $2,  $3, $4) RETURNING *', 
                [studentInfo.firstName, studentInfo.lastName, studentInfo.dateOfBirth, studentInfo.gradeLevel]
            )
            console.log(`Student added:`, res.rows[0])
        }catch(err){
            console.error(`Error creating student`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async deleteStudent(studentId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM students WHERE student_id = $1',
                [studentId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error deleting, Student ${studentId} does not exits`)
            }
            console.log(`Student ${studentId} deleted`)
        }catch(err){
            console.error(`Failed to delete student with id: ${studentId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async assignStudentGuardian(studentId: number, guardianId: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query('UPDATE students SET guardian_id = $1 WHERE student_id = $2',
                [guardianId, studentId]
            )
            if(res.rowCount === 0){
                 throw new Error(`Error assigining guardian to student. Student ${studentId} does not exist`)
            }
            console.log(`Guardian ${guardianId} assigned to student ${studentId}`)

        }catch(err){
            console.error(`Error assigning guardian ${guardianId} to student ${studentId}`, err)
            throw err
        }finally{
            client.release()
        }

    }
}