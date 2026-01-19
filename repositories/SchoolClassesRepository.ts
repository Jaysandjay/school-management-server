import type { Course } from "../types/Course";
import type { Student } from "../types/Student";
import { StudentGrade } from "../types/StudentGrade";
import { Teacher } from "../types/Teacher";
import { ClassesRepository } from "./types/classes.base.repository";
import { Pool } from "pg";
import dotenv from "dotenv";
import logger from "../util/logger";
import logError from "../util/logError";

dotenv.config();

const pool = new Pool({connectionString: process.env.CONNECTION_STRING})

export class SchoolClassesRepository implements ClassesRepository {
    async getClasses(): Promise<Course[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM classes')
            logger.debug('DB: fetch classes', {
                rowCount: res.rows.length,
                query: "getClasses",
                rows:res.rows
            })
            return res.rows
        }catch(err){
            logError("Error fetching classes", err)
            throw err
        }finally{
            client.release()
        }
    }

    async getClass(classId: number): Promise<Course> {
        const client = await pool.connect()
        try {
            const res = await client.query('SELECT * FROM classes WHERE class_id = $1',
                [classId]
            )
            logger.debug('DB: fetch class', {
                rowCount: res.rows.length,
                query: "getClass",
                rows:res.rows
            })
            if(res.rowCount === 0){
                let error = new Error("Failed to get class")
                logError(`Class id ${classId} Does not Exist`, error)
                throw error
            }
            return res.rows[0]
        }catch(err){
            logError(`Error getting class`, err)
            throw err
        }finally{
            client.release()
        }

    }

    async addClass(course: Course): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query(`INSERT INTO classes(class_name, grade_level, capacity) VALUES($1, $2, $3) RETURNING *`,
                [course.className, course.gradeLevel, course.capacity]
            )
            logger.debug('DB: Add class', {
                rowCount: res.rows.length,
                query: "addClass",
                rows:res.rows
            })
        }catch(err){
            logError(`Error creating class`, err)
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
                RETURNING *
                `,
            [updatedClass.className, updatedClass.gradeLevel, updatedClass.capacity, classId]
            )
            logger.debug('DB: update class', {
                rowCount: res.rows.length,
                query: "updateClass",
                rows:res.rows
            })
        }catch(err){
            logError("Error updating class", err)
            throw err
        }finally {
            client.release()
        }
    }

    async deleteClass(classId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM classes WHERE class_id = $1 RETURNING *',
                [classId]
            )
            logger.debug('DB: Delete class', {
                rowCount: res.rows.length,
                query: "deleteClass",
                rows:res.rows
            })
            if(res.rowCount === 0){
                let error = new Error("Failed to delete class")
                logError(`Class ${classId} does not exist`, error)
                throw error
            }
        }catch(err){
            logError(`Failed to delete class with id: ${classId}`, err)
            throw err 
        }finally{
            client.release()
        }
    }
        

    async assignTeacherToClass(classId: number, teacherId: number): Promise<void> {
        const client = await pool.connect()
       try {
            const res = await client.query(
                'UPDATE classes SET teacher_id = $1 WHERE class_id = $2 RETURNING *',
                [teacherId, classId]
            )
            logger.debug('DB: Update class teacher', {
                rowCount: res.rows.length,
                query: "assignTeacherToClass",
                rows:res.rows
            })
            if (res.rowCount === 0) {
                let error = new Error("Failed to update class Teacher")
                logError(`Class ${classId} does not exist`, error)
                throw error
            }
        } catch (err) {
            logError(`Error assigning teacher ${teacherId} to class ${classId}`, err)
            throw err
        } finally {
            client.release()
        }
    }

    async removeTeacherFromClass(classId: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                'UPDATE classes SET teacher_id = NULL WHERE class_id = $1 RETURNING *',
                [classId]
            )
            logger.debug('DB: Update class teacher (Remove)', {
                rowCount: res.rows.length,
                query: "removeTeacherFromClass",
                rows:res.rows
            })
            if (res.rowCount === 0) {
                let error = new Error("Failed to remove teacher from class")
                logError(`Class ${classId} does not exist`, error)
                throw error
            }
        } catch (err) {
            logError(`Error removing teacher from class ${classId}`, err)
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
            logger.debug('DB: Get class teacher', {
                rowCount: res.rows.length,
                query: "getClassTeacher",
                rows: res.rows
            })
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
        logger.debug('DB: Get class students', {
                rowCount: res.rows.length,
                query: "getClassStudents",
                rows: res.rows
            })
        if (res.rowCount === 0) {
            return []
        }

        return res.rows
        } catch (err) {
            logError(`Error getting students for class ${classId}`, err)
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
            logger.debug('DB: Get classes non students', {
                rowCount: res.rows.length,
                query: "getClassAvailableStudents",
                rows: res.rows
            })
            return students.rows
        }
        const enrolledStudentIds: number[] = res.rows.map(row => row.student_id)
        const availableStudents = students.rows.filter((student) => {
                return !enrolledStudentIds.includes(student.student_id)
            })
        logger.debug('DB: Get classes non students', {
                rowCount: availableStudents.length,
                query: "getClassAvailableStudents",
                rows: availableStudents
            })

        return availableStudents
        } catch (err) {
            logError(`Error getting available students for class ${classId}`, err)
            throw err
        } finally {
            client.release()
        }
    }

    
    async getUnassignedClasses (): Promise<Course[]> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                SELECT *
                FROM classes
                WHERE teacher_id IS NULL
                `
            )

            logger.debug('DB: Get unassigned classes', {
                rowCount: res.rows.length,
                query: "getUnassignedClasses",
                rows: res.rows
            })
            if (res.rows.length === 0){
                return []
            }
            return res.rows
        } catch(err) {
            logError("Error getting unassigned classes", err)
            throw err
        } finally {
            client.release()
        }
    }

    async getClassGrades(classId: number): Promise<StudentGrade[]> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                SELECT *
                FROM student_grades_view
                WHERE class_id=$1    
                `,
                [classId]
            )
            logger.debug('DB: Get class grades', {
                rowCount: res.rows.length,
                query: "getClassGrades",
                rows: res.rows
            })
            if (res.rows.length === 0){
                return []
            }
            return res.rows
        }catch(err) {
            logError("Error getting grades", err)
            throw err
        } finally {
            client.release()
        }
    }

}