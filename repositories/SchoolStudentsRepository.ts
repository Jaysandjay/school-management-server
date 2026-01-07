import { Address } from "../types/Address";
import { Course } from "../types/Course";
import { Guardian } from "../types/Guardian";
import { GuardianRelationship } from "../types/GuardianRelationship";
import type { Student } from "../types/Student";
import { StudentRepository } from "./types/students.base.repository";
import { Pool } from "pg";

const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})

export class SchoolStudentsRepository implements StudentRepository {
    
    async getStudents(): Promise<Student[]> {
        const client = await pool.connect()
        try {
            const res = await client.query('SELECT * FROM students')
            console.log(res.rows)
            return res.rows
        }catch(err){
            console.error("Failed to fetch students", err)
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

    async updateStudent(studentId: number, studentInfo: Student): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`UPDATE students SET first_name=$1, last_name=$2, date_of_birth=$3, grade_level=$4 WHERE student_id=$5`,
                [studentInfo.firstName, studentInfo.lastName, studentInfo.dateOfBirth, studentInfo.gradeLevel, studentId]
            )
        }catch(err){
            console.error("Error updating student", err)
            throw err
        }finally {
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

    async assignStudentGuardian(studentId: number, guardianId: number, relationship: GuardianRelationship): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query('INSERT INTO student_guardians(student_id, guardian_id, relationship) VALUES($1, $2, $3)',
                [studentId, guardianId, relationship]
            )
            console.log(`Guardian ${guardianId} assigned to student ${studentId}`)

        }catch(err){
            console.error(`Error assigning guardian ${guardianId} to student ${studentId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async deleteStudentGuardian(studentId: number, guardianId: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`DELETE FROM student_guardians WHERE student_id=$1 AND guardian_id=$2`,
                [studentId, guardianId]
            )
            console.log(`Guardian ${guardianId} removed from student ${studentId}`)
        }catch (err){
            console.error(`Error removing guardian ${guardianId} from student ${studentId}`, err)
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
            console.log("Guardians", res.rows)

            if(res.rows.length === 0){
                return []
            }
            return res.rows; 
        } catch (err) {
            console.error(`Error getting guardians for student ${studentId}`, err);
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
            if(!availableGuardians || availableGuardians.length === 0){
                return []
            }
            console.log(`Student ${studentId} available guardians:`, availableGuardians)
            return availableGuardians
        }catch(err) {
            console.error("Error getting filtered guardians", err)
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
            console.log("Student address", res.rows[0])
            if (res.rows.length === 0) {
                return null
            }
            return res.rows[0]
        }catch(err){
            console.error(`Error getting address for student ${studentId}`, err)
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

            await client.query(
                `
                UPDATE students
                SET address_id=$1
                WHERE student_id=$2
                `,
                [newAddressId, studentId]
            )
            await client.query(`COMMIT`)
        }catch(err){
            await client.query(`ROLLBACK`)
            console.error("Error adding student address", err)
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
                `,
                [address.street, address.city, address.province, address.postalCode, studentId]
            )
        } catch(err) {
            console.error("Error updating student address", err)
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
            console.log(`Student ${studentId} classes`, studentClasses)
            return studentClasses.rows
        }catch(err){
            console.error("Error getting students classes", err)
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
            console.log(`Student ${studentId} classes`, availableClasses)
            return availableClasses.rows
        }catch(err){
            console.error("Error getting students classes", err)
            throw err
        } finally {
            client.release()
        }  
    }

    async enrollStudent(studentId: number, classId: number): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`INSERT INTO enrollments(student_id, class_id) VALUES($1, $2)`,
                [studentId, classId]
            )
            console.log(`Student ${studentId} enrolled in class ${classId}`)
        }catch (err) {
            console.error(`Error enrolling student ${studentId} in class ${classId}`, err)
            throw err
        }finally {
            client.release()
        }
    }

    async unenrollStudent(studentId: number, classId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM enrollments WHERE student_id=$1 AND class_id=$2',
                [studentId, classId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error unenrolling student, student ${studentId}, class ${classId} is not registered`)
            }
            console.log(`Student ${studentId} unenrolled from class ${classId}`)
        }catch(err){
            console.error(`Error unenrolling student ${studentId} from class ${classId}`, err)
            throw err
        }finally{
            client.release()
        }
    }
    
}
