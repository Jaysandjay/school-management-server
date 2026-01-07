import { EnrollmentRepository } from "./types/enrollment.base.reposirory";
import type { Enrollment } from "../types/Enrollment";
import { Pool } from "pg";

const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})

export class SchoolEnrollmentsRepository implements EnrollmentRepository {
    // async enrollStudent(studentId: number, classId: number): Promise<void> {
    //     const client = await pool.connect()
    //     try {
    //         await client.query('INSERT INTO enrollments(student_id, class_id) VALUES($1, $2)',
    //             [studentId, classId]
    //         )
    //         console.log(`Student ${studentId} enrolled in class ${classId}`)

    //     }catch(err){
    //         console.error(`Error enrolling student ${studentId} to class ${classId}`, err)
    //         throw err
    //     }finally{
    //         client.release()
    //     }
    // }

    // async setGrade(enrollment: Enrollment): Promise<void> {
    //     const client = await pool.connect()
    //     try{
    //         const res = await client.query('UPDATE enrollments SET grade=#1 WHERE student_id=$2 AND class_id=$3 RETURNING *',
    //             [enrollment.grade, enrollment.studentId, enrollment.classId]
    //         )

    //         if(res.rowCount === 0){
    //             throw new Error(`Error setting Grade, student ${enrollment.studentId} or class ${enrollment.classId} is not registered`)
    //         }
    //         console.log(`Grade ${enrollment.grade} set for student ${enrollment.studentId}, class ${enrollment.classId}`)
    //     }catch(err){
    //         console.error(`Error setting grade ${enrollment.grade} for student ${enrollment.studentId}, class ${enrollment.classId}`, err)
    //         throw err
    //     }finally{
    //         client.release()
    //     }
    // }

    // async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    //     const client = await pool.connect()
    //     try{
    //         const res = await client.query('SELECT class_id FROM enrollments WHERE student_id=$1',
    //             [studentId]
    //         )
    //         console.log(`Student ${studentId} enrollments:`, res.rows)
    //         return res.rows
    //     }catch(err){
    //         console.error(`Error getting enrollments for student ${studentId}`, err)
    //         throw err
    //     }finally{
    //         client.release()
    //     }
    // }

    // async getEnrollmentsByClass(classId: number): Promise<Enrollment[]> {
    //     const client = await pool.connect()
    //     try{
    //         const res = await client.query('SELECT student_id FROM enrollments WHERE class_id=$1',
    //             [classId]
    //         )
    //         console.log(`Enrollments for class ${classId}`, res.rows)
    //         return res.rows
    //     }catch(err){
    //         console.error(`Error getting enrollments for class ${classId}`, err)
    //         throw err
    //     }finally{
    //         client.release()
    //     }
    // }

}