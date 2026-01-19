import { Address } from "../types/Address";
import { Course } from "../types/Course";
import type  { Teacher } from "../types/Teacher";
import { TeachersRepository } from "./types/teachers.base.repository";
import { Pool } from "pg";
import dotenv from "dotenv";
import logger from "../util/logger";
import logError from "../util/logError";

dotenv.config();

const pool = new Pool({connectionString: process.env.CONNECTION_STRING})

export class SchoolTeachersRepository implements TeachersRepository {

    async getTeachers(): Promise<Teacher[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM teachers')
            logger.debug('DB: Fetch teachers', {
                rowCount: res.rows.length,
                query: "getTeachers",
                rows: res.rows
            })
            return res.rows
        }catch(err){
            logError("Error fetching teachers", err)
            throw err
        }finally{
            client.release()
        }
    }

     async getTeacher(teacherId: number): Promise<Teacher> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM teachers WHERE teacher_id = $1',
                [teacherId]
            )
            if(res.rowCount=== 0){
                let error = new Error("Failed to get teacher")
                logError("Teacher Does not Exist", error)
                throw error
            }
            logger.debug('DB: Fetch teacher', {
                rowCount: res.rows.length,
                query: "getTeacher",
                rows: res.rows
            })
            return res.rows[0]
        }catch(err){
            logError("Error getting Teacher", err) 
            throw err
        }finally{
            client.release()
        }
    }

    async addTeacher(teacherData: Teacher): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('INSERT INTO teachers(first_name, last_name, email, phone) VALUES($1, $2, $3, $4) RETURNING *',
                [teacherData.firstName, teacherData.lastName, teacherData.email, teacherData.phone]
            )
            logger.debug('DB: Add teacher', {
                rowCount: res.rows.length,
                query: "addTeacher",
                rows: res.rows
            })
        }catch(err){
            logError("Error adding Teacher", err)
            throw err
        }finally{
            client.release()
        }
    }

    async updateTeacher(teacherId: number, updatedTeacherInfo: Teacher): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('UPDATE teachers SET first_name=$1, last_name=$2, email=$3, phone=$4 WHERE teacher_id=$5 RETURNING *',
                [
                    updatedTeacherInfo.firstName,
                    updatedTeacherInfo.lastName,
                    updatedTeacherInfo.email,
                    updatedTeacherInfo.phone,
                    teacherId
                ]
            )
            logger.debug('DB: Update teachers', {
                rowCount: res.rows.length,
                query: "updateTeacher",
                rows: res.rows
            })
        }catch(err){
            logError(`Error updating Teacher ${teacherId}` , err)
            throw err
        }finally{
            client.release()
        }
    }

    async deleteTeacher(teacherId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM teachers WHERE teacher_id = $1 RETURNING *',
                [teacherId]
            )
            if(res.rowCount === 0){
                let error = new Error("Failed to delete teacher")
                logError(`Error deleting, teacher ${teacherId} does not exist`, error)
                throw error
            }
            logger.debug('DB: Delete teachers', {
                rowCount: res.rows.length,
                query: "deleteTeacher",
                rows: res.rows
            })
        }catch(err){
            logError(`Failed to delete teacher with id: ${teacherId}`, err)
            throw err
        }finally{
            client.release()
        }
    }
    
    async getTeacherAddress(teacherId: number): Promise<Address> {
            const client = await pool.connect()
            try {
                const res = await client.query(
                    `
                    SELECT 
                        a.street, 
                        a.city, 
                        a.province, 
                        a.postal_code 
                    FROM addresses a JOIN teachers t USING(address_id) WHERE t.teacher_id=$1
                    `,
                    [teacherId]
                )
                logger.debug('DB: Get teacher address', {
                    rowCount: res.rows.length,
                    query: "getTeacherAddress",
                    rows: res.rows
                })
                if (res.rows.length === 0) {
                    return null
                }
                return res.rows[0]
            }catch(err){
                logError(`Error getting address for teacher ${teacherId}`, err)
                throw err
            }finally{
                client.release()
            }
        }
        
    async addTeacherAddress(teacherId: number, address: Address): Promise<void> {
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
                    UPDATE teachers
                    SET address_id=$1
                    WHERE teacher_id=$2
                    RETURNING *
                    `,
                    [newAddressId, teacherId]
                )
                logger.debug('DB: Add teacher address', {
                    rowCount: updateRes.rows.length,
                    query: "addTeacherAddress",
                    rows: updateRes.rows
                })
                await client.query(`COMMIT`)
            }catch(err){
                await client.query(`ROLLBACK`)
                logError("Error adding teacher address", err)
                throw err        
            }finally {
                client.release()
            }
        }

        async updateTeacherAddress(teacherId: number, address: Address): Promise<void> {
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
                        FROM teachers t
                        WHERE t.address_id = a.address_id
                            AND teacher_id = $5
                        RETURNING *
                        `,
                        [address.street, address.city, address.province, address.postalCode, teacherId]
                    )
                    logger.debug('DB: Update teacher address', {
                        rowCount: res.rows.length,
                        query: "updateTeacherAddress",
                        rows: res.rows
                    })
                } catch(err) {
                    logError("Error updating teacher address", err)
                    throw err
                } finally {
                    client.release()
                }
            }

        async getTeacherClasses(teacherId: number): Promise<Course[]> {
            const client = await pool.connect()
            try {
                const res = await client.query(
                    `
                    SELECT *
                    FROM classes
                    WHERE teacher_id=$1
                    `,
                    [teacherId]
                )
                logger.debug('DB: Get teacher classes', {
                    rowCount: res.rows.length,
                    query: "getTeacherClasses",
                    rows: res.rows
                })
                if (res.rows.length === 0){
                    return []
                }
                return res.rows
            } catch(err) {
                logError("Error getting teacher classes", err)
                throw err
            } finally {
                client.release()
            }
        }

       

}