import { Address } from "../types/Address";
import { Course } from "../types/Course";
import { Guardian } from "../types/Guardian";
import { GuardianRelationship } from "../types/GuardianRelationship";
import type { Student } from "../types/Student";
import { StudentGrade } from "../types/StudentGrade";
import { StudentRepository } from "./types/students.base.repository";
import { Pool } from "pg";
import dotenv from "dotenv";
import logger from "../util/logger";
import logError from "../util/logError";
import { query } from "winston";
import e from "express";

dotenv.config();

const pool = new Pool({connectionString: process.env.CONNECTION_STRING})

export class SchoolStudentsRepository implements StudentRepository {
    
    async getStudents(): Promise<Student[]> {
        const client = await pool.connect()
        try {
            const res = await client.query('SELECT * FROM students')
            logger.debug('DB: fetch students', {
                rowCount: res.rows.length,
                query: "getStudents",
                rows:res.rows
            })
            return res.rows
        }catch(err){
            logError("Failed to fetch students", err)
            throw err
        }finally{
            client.release()
        }
    }

    async getStudent(studentId: number): Promise<Student> {
        const client = await pool.connect()
        
        try{
            const res = await client.query('SELECT * FROM students WHERE student_id = $1',
                [studentId]
            )
            if(res.rowCount === 0){
                let err = new Error(`Error getting student`)
                logError(`Student id ${studentId} Does not Exist`, err)
                throw err
            }
            logger.debug('DB: fetch student', {
                rowCount: res.rows.length,
                query: "getStudent",
                rows:res.rows
            })
            return res.rows[0]
        }catch(err){
            logError('Error getting Student', err)
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
            logger.debug('DB: add student', {
                rowCount: res.rows.length,
                query: "addStudent",
                rows:res.rows
            })
        }catch(err){
            logError(`Error creating student`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async updateStudent(studentId: number, studentInfo: Student): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`
                UPDATE students 
                SET 
                    first_name=$1, 
                    last_name=$2, 
                    date_of_birth=$3, 
                    grade_level=$4 
                WHERE student_id=$5
                RETURNING *
                `,
                [studentInfo.firstName, studentInfo.lastName, studentInfo.dateOfBirth, studentInfo.gradeLevel, studentId]
            )
            logger.debug('DB: Updated student', {
                rowCount: res.rows.length,
                query: "updateStudent",
                rows:res.rows
            })
        }catch(err){
            logError("Error updating student", err)
            throw err
        }finally {
            client.release()
        }
    }

    async deleteStudent(studentId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM students WHERE student_id = $1 RETURNING *',
                [studentId]
            )
            if(res.rowCount === 0){
                let err = new Error(`Error deleting Student`)
                logError(`Student Id ${studentId} does not exist`, err)
                throw err
            }
            logger.debug(`DB: Student ${studentId} deleted`, {
                rowCount: res.rows.length,
                query: "deleteStudent",
                rows:res.rows
            })
        }catch(err){
            logError(`Failed to delete student with id: ${studentId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async assignStudentGuardian(studentId: number, guardianId: number, relationship: GuardianRelationship): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query('INSERT INTO student_guardians(student_id, guardian_id, relationship) VALUES($1, $2, $3) RETURNING *',
                [studentId, guardianId, relationship]
            )
            logger.debug(`DB: Guardian ${guardianId} assigned to student ${studentId}`, {
                rowCount: res.rows.length,
                query: "assignStudentGuardian",
                rows:res.rows
            })

        }catch(err){
            logError(`Error assigning guardian ${guardianId} to student ${studentId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async deleteStudentGuardian(studentId: number, guardianId: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`DELETE FROM student_guardians WHERE student_id=$1 AND guardian_id=$2 RETURNING *`,
                [studentId, guardianId]
            )
            logger.debug(`Guardian ${guardianId} removed from student ${studentId}`, {
                rowCount: res.rows.length,
                query: "deleteStudentGuardian",
                rows:res.rows
            })
        }catch (err){
            logError(`Error removing guardian ${guardianId} from student ${studentId}`, err)
            throw err
        }finally {
            client.release()
        }
    }

    async getStudentGuardians(studentId: number): Promise<Guardian[]> {
        const client = await pool.connect();
        try {
            const res = await client.query(
                `
                SELECT *
                FROM student_guardian_view
                WHERE student_id = $1
                `,
                [studentId]
            );
            logger.debug("DB: Fetch student guardians", {
                rowCount: res.rows.length,
                query: "getStudentGuardians",
                rows:res.rows
            })

            if(res.rows.length === 0){
                return []
            }
            return res.rows; 
        } catch (err) {
            logError(`Error getting guardians for student ${studentId}`, err);
            throw err;
        } finally {
            client.release();
        }
    }

    async getStudentAvailableGuardians(studentId: number): Promise<Guardian[]> {
        const client = await pool.connect()
        try {
            const guardians = await client.query(`SELECT * FROM guardians`)
            const assignedGuardians = await client.query(`SELECT guardian_id FROM student_guardians WHERE student_id=$1`,
                [studentId]
            )
            const guardianIds: number[] = assignedGuardians.rows.map(row => row.guardian_id)

            const availableGuardians = guardians.rows.filter((guardian) => {
                return !guardianIds.includes(guardian.guardian_id)
            })

            logger.debug(`DB: Student ${studentId} available guardians:`, {
                rowCount: availableGuardians.length,
                query: "getStudentAvailableGuardians",
                rows: availableGuardians
            })

            if(!availableGuardians || availableGuardians.length === 0){
                return []
            }
            return availableGuardians
        }catch(err) {
            logError("Error getting filtered guardians", err)
            throw err
        }finally {
            client.release()
        }
    }

    async getStudentAddress(studentId: number): Promise<Address> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                SELECT 
                    a.street, 
                    a.city, 
                    a.province, 
                    a.postal_code 
                FROM addresses a JOIN students s USING(address_id) WHERE s.student_id=$1
                `,
                [studentId]
            )
            logger.debug("DB: Get student address", {
                rowCount: res.rows.length,
                query: "getStudentAddress",
                rows:res.rows
            })
            if (res.rows.length === 0) {
                return null
            }
            return res.rows[0]
        }catch(err){
            logError(`Error getting address for student ${studentId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async addStudentAddress(studentId: number, address: Address): Promise<void> {
        const client = await pool.connect()
        try {
            await client.query(`BEGIN`)
            const res = await client.query(
                `
                INSERT INTO addresses (street, city, province, postal_code)
                values($1, $2, $3, $4)
                RETURNING address_id
                `,
                [address.street, address.city, address.province, address.postalCode]
            )
            const newAddressId = res.rows[0].address_id

            const updateRes = await client.query(
                `
                UPDATE students
                SET address_id=$1
                WHERE student_id=$2
                RETURNING *
                `,
                [newAddressId, studentId]
            )
            await client.query(`COMMIT`)
            logger.debug('DB: Update student address', {
                rowCount: updateRes.rows.length,
                query: "addStudentAddress",
                rows: updateRes.rows
            })
        }catch(err){
            await client.query(`ROLLBACK`)
            logError("Error adding student address", err)
            throw err        
        }finally {
            client.release()
        }
    }

    async updateStudentAddress(studentId: number, address: Address): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                UPDATE addresses a 
                SET 
                    street=$1,
                    city=$2,
                    province=$3,
                    postal_code=$4
                FROM students s
                WHERE s.address_id = a.address_id
                    AND student_id = $5
                RETURNING *
                `,
                [address.street, address.city, address.province, address.postalCode, studentId]
            )
            logger.debug("DB: Updated Address", {
                rowCount: res.rows.length,
                query: "updateStudentAddress",
                rows:res.rows
            })
        } catch(err) {
            logError("Error updating student address", err)
            throw err
        } finally {
            client.release()
        }
    }


    async getStudentsClasses(studentId: number): Promise<Course[]> {
        const client = await pool.connect()
        try {
            const enrollments = await client.query(`SELECT class_id FROM enrollments WHERE student_id=$1`,
                [studentId]
            )
            const classIds: number[] = enrollments.rows.map(row => row.class_id)

            const studentClasses = await client.query(`SELECT * from classes WHERE class_id = ANY($1)`,
                [classIds]
            )
            if(!enrollments || enrollments.rows.length === 0){
                return []
            }
            logger.debug(`DB: Get Student ${studentId} classes`, {
                rowCount: studentClasses.rows.length,
                query: "getStudentClasses",
                rows: studentClasses.rows
            })
            return studentClasses.rows
        }catch(err){
            logError("Error getting students classes", err)
            throw err
        } finally {
            client.release()
        }  
    }

    async getAvailableStudentClasses(studentId: number): Promise<Course[]> {
        const client = await pool.connect()
        try {
            const enrollments = await client.query(`SELECT class_id FROM enrollments WHERE student_id=$1`,
                [studentId]
            )
            const classIds: number[] = enrollments.rows.map(row => row.class_id)

            const availableClasses = await client.query(`SELECT * from classes WHERE class_id <> ALL($1)`,
                [classIds]
            )
            logger.debug(`DB: Get Student ${studentId} available classes`, {
                rowCount: availableClasses.rows.length,
                query: "getAvailableStudentClasses",
                rows: availableClasses.rows
            })
            return availableClasses.rows
        }catch(err){
            logError("Error getting students classes", err)
            throw err
        } finally {
            client.release()
        }  
    }

    async enrollStudent(studentId: number, classId: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`INSERT INTO enrollments(student_id, class_id) VALUES($1, $2) RETURNING *`,
                [studentId, classId]
            )
            logger.debug(`DB: Student ${studentId} enrolled in class ${classId}`,{
                rowCount: res.rows.length,
                query: "enrollStudent",
                rows: res.rows
            })
        }catch (err) {
            logError(`Error enrolling student ${studentId} in class ${classId}`, err)
            throw err
        }finally {
            client.release()
        }
    }

    async unenrollStudent(studentId: number, classId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM enrollments WHERE student_id=$1 AND class_id=$2 RETURNING *',
                [studentId, classId]
            )
            if(res.rowCount === 0){
                let err = new Error(`Error unenrolling student`)
                logError(`student ${studentId}, class ${classId} is not registered`, err)
                throw err
            }
            logger.debug(`DB: Student ${studentId} unenrolled from class ${classId}`, {
                rowCount: res.rows.length,
                query: "unenrollStudent",
                rows: res.rows
            })
        }catch(err){
            logError(`Error unenrolling student ${studentId} from class ${classId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async getStudentGrades(studentId: number): Promise<StudentGrade[]> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                SELECT *
                FROM student_grades_view
                WHERE student_id=$1    
                `,
                [studentId]
            )

            logger.debug(`DB: Get student ${studentId} grades`, {
                rowCount: res.rows.length,
                query: "getStudentGrades",
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

    async updateStudentGrade(studentId: number, classId: number, grade: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                UPDATE enrollments SET grade=$1 WHERE student_id=$2 AND class_id=$3 
                `,
                [grade, studentId, classId]
            )
            const enrollment = await client.query(`SELECT * FROM enrollments WHERE student_id=$1 AND class_id=$2`,
                [studentId, classId]
            )
            logger.debug(`DB: Updated grade to ${grade} for student ${studentId}`, {
                rowCount: enrollment.rows.length,
                query: "updateStudentGrade",
                rows: enrollment.rows
            })
    
        }catch(err) {
            logError("Error updating grade", err)
            throw err
        } finally {
            client.release()
        }
    }
    
    
}
