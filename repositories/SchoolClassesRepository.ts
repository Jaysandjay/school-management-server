import type { Course } from "../types/Course";
import type { Student } from "../types/Student";
import { Teacher } from "../types/Teacher";
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

    async addClass(course: Course): Promise<void> {
        const client = await pool.connect()
        console.log(course)
        console.log(course.className, course.gradeLevel, course.capacity)
        try{
            const res = await client.query(`INSERT INTO classes(class_name, grade_level, capacity) VALUES($1, $2, $3)`,
                [course.className, course.gradeLevel, course.capacity]
            )
        }catch(err){
            console.error(`Error creating class`, err)
            throw err
        }finally{
            client.release()
        }

    }

    async updateClass(classId: number, updatedClass: Course): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`
                UPDATE classes
                SET
                    class_name=$1,
                    grade_level=$2,
                    capacity=$3
                WHERE 
                    class_id=$4
                `,
            [updatedClass.className, updatedClass.gradeLevel, updatedClass.capacity, classId]
            )
        }catch(err){
            console.error("Error updating class", err)
            throw err
        }finally {
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

    async removeTeacherFromClass(classId: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                'UPDATE classes SET teacher_id = NULL WHERE class_id = $1',
                [classId]
            )

            if (res.rowCount === 0) {
                throw new Error(`Error removing teacher to class. Class ${classId} does not exist`)
            }
        } catch (err) {
            console.error(`Error removing teacher from class ${classId}`, err)
            throw err
        } finally {
            client.release()
        }
    }

    async getClassTeacher(classId: number): Promise<Teacher> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                SELECT 
                    t.teacher_id,
                    t.first_name,
                    t.last_name,
                    t.email,
                    t.phone
                FROM classes c JOIN teachers t ON c.teacher_id = t.teacher_id
                WHERE class_id=$1
                `,
                [classId]
            )
            console.log("Teacher:", res.rows)
            if(res.rows.length === 0){
                return null
            }
            return res.rows[0]
        }catch (err){
            console.error("Error getting teacher", err)
            throw err
        }finally{
            client.release()
        }
    }

    async getClassStudents(classId: number): Promise<Student[]> {
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
            return []
        }

        return res.rows
        } catch (err) {
            console.error(`Error getting students for class ${classId}`, err)
            throw err
        } finally {
            client.release()
        }
    }

    async getClassAvailableStudents(classId: number): Promise<Student[]> {
        const client = await pool.connect()
        try {
        const students = await client.query(`SELECT * FROM students`)
        const res = await client.query(
            `
            SELECT s.student_id
            FROM students s
            JOIN enrollments e ON e.student_id = s.student_id
            WHERE e.class_id = $1
            `,
            [classId]
        )
        if (res.rowCount === 0) {
            return students.rows
        }
        const enrolledStudentIds: number[] = res.rows.map(row => row.student_id)
        const availableStudents = students.rows.filter((student) => {
                return !enrolledStudentIds.includes(student.student_id)
            })

        return availableStudents
        } catch (err) {
            console.error(`Error getting available students for class ${classId}`, err)
            throw err
        } finally {
            client.release()
        }
    }
}