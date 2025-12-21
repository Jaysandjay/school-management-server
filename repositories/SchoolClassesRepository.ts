import type { Course } from "../types/Course";
import type { Student } from "../types/Student";
import { ClassesRepository } from "./types/classes.base.repository";
import { Pool } from "pg";

const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})

export class SchoolClassesRepository implements ClassesRepository {
    async getClasses(): Promise<Course[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM classes')
            console.log(res.rows)
            return res.rows
        }catch(err){
            console.error("Error fetching classes", err)
            throw err
        }finally{
            client.release()
        }
    }

    async getClass(classId: number): Promise<Course> {
        console.log("Get Class")
        const client = await pool.connect()

        try {
            const res = await client.query('SELECT * FROM classes WHERE class_id = $1',
                [classId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error getting class. Class id ${classId} Does not Exist`)
            }
            return res.rows[0]
        }catch(err){
            console.error(`Error getting class`, err)
            throw err
        }finally{
            client.release()
        }

    }

    async getStudentsClasses(studentId: number): Promise<Course[]> {
        const client = await pool.connect()
        return [
            {className: "test"}
        ]  
    }

        async getTeachersClasses(teacherId: number): Promise<Course[]> {
        const client = await pool.connect()
        return [
            {className: "test"}
        ]  
    }

    async addClass(className: string): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query(`INSERT INTO classes(class_name) VALUES($1)`,
                [className]
            )
        }catch(err){
            console.error(`Error creating class`, err)
            throw err
        }finally{
            client.release()
        }

    }

    async deleteClass(classId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM classes WHERE class_id = $1',
                [classId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error deleting, class ${classId} does not exist`)
            }
        }catch(err){
            console.error(`Failed to delete class with id: ${classId}`, err)
            throw err 
        }finally{
            client.release()
        }
    }
        

    async assignTeacherToClass(classId: number, teacherId: number): Promise<void> {
        const client = await pool.connect()
       try {
            const res = await client.query(
                'UPDATE classes SET teacher_id = $1 WHERE class_id = $2',
                [teacherId, classId]
            )

            if (res.rowCount === 0) {
                throw new Error(`Error assigining teacher to class. Class ${classId} does not exist`)
            }
        } catch (err) {
            console.error(`Error assigning teacher ${teacherId} to class ${classId}`, err)
            throw err
        } finally {
            client.release()
        }
        
    }

    async getClassEnrollments(classId: number): Promise<Student[]> {
        const client = await pool.connect()
        try {
        const res = await client.query(
            `
            SELECT s.*
            FROM students s
            JOIN enrollments e ON e.student_id = s.student_id
            WHERE e.class_id = $1
            `,
            [classId]
        )

        if (res.rowCount === 0) {
            throw new Error(`No students enrolled in class ${classId}`)
        }

        return res.rows
    } catch (err) {
        console.error(`Error getting enrollments for class ${classId}`, err)
        throw err
    } finally {
        client.release()
    }
    }
}