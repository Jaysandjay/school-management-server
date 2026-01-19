import { Address } from "../types/Address";
import type { Guardian } from "../types/Guardian";
import { Student } from "../types/Student";
import { GuardiansRepository } from "./types/guardians.base.repository";
import { Pool } from "pg";
import dotenv from "dotenv";
import logger from "../util/logger";
import logError from "../util/logError";

dotenv.config();

const pool = new Pool({connectionString: process.env.CONNECTION_STRING})

export class SchoolGuardiansRepository implements GuardiansRepository {
    async getGuardians(): Promise<Guardian[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM guardians')
            logger.debug('DB: Fetch guardians', {
                rowCount: res.rows.length,
                query: "getGuardians",
                rows: res.rows
            })
            return res.rows
        }catch(err){
            logError("Error fetching guardians", err)
            throw err
        }finally{
            client.release()
        }
    }

    async getGuardian(guardianId: number): Promise<Guardian> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM guardians WHERE guardian_id = $1', 
                [guardianId]
            )
            logger.debug('DB: Fetch guardian', {
                rowCount: res.rows.length,
                query: "getGuardian",
                rows: res.rows
            })
            if(res.rowCount === 0){
                let error = new Error(("Failed to get guardian"))
                logError(`Error, Guardian ID ${guardianId} Does not Exist`, error)
                throw error
            }
            return res.rows[0]
        }catch(err){
            logError('Error getting Guardian', err)
            throw err
        }finally{
            client.release()
        }
    }

    async addGuardian(guardianInfo: Guardian): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query('INSERT INTO guardians(first_name, last_name, phone, email) VALUES($1, $2,  $3, $4) RETURNING *', 
                [guardianInfo.firstName, guardianInfo.lastName, guardianInfo.phone, guardianInfo.email]
            )
            logger.debug('DB: Add guardian', {
                rowCount: res.rows.length,
                query: "addGuardian",
                rows: res.rows
            })
        }catch(err){
            logError(`Error creating guardian`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async updateGuardian(guardianId: number, updatedGuardian: Guardian): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`UPDATE guardians SET first_name=$1, last_name=$2, phone=$3, email=$4 WHERE guardian_id=$5 RETURNING *`,
                [updatedGuardian.firstName, updatedGuardian.lastName, updatedGuardian.phone, updatedGuardian.email, guardianId]
            )
            logger.debug('DB: Update guardian', {
                rowCount: res.rows.length,
                query: "updateGuardian",
                rows: res.rows
            })
        }catch(err){
            logError("Error updating guardian", err)
            throw err
        }finally {
            client.release()
        }
    }

    async deleteGuardian(guardianId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM guardians WHERE guardian_id = $1 RETURNING *',
                [guardianId]
            )
            logger.debug('DB: Delete guardian', {
                rowCount: res.rows.length,
                query: "deleteGuardian",
                rows: res.rows
            })
            if(res.rowCount === 0){
                let error = new Error("Failed to delete guardian")
                logError(`Error deleting, Guardian ${guardianId} does not exits`, error)
                throw error
            }
        }catch(err){
            logError(`Failed to delete guardian with id: ${guardianId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async getGuardianStudents(guardianId: number): Promise<Student[]> {
        const client = await pool.connect()
        try {
            const res = await client.query(
                `
                SELECT *
                FROM guardian_student_view
                WHERE guardian_id = $1
                `,
                [guardianId]
            );
            logger.debug('DB: Get guardian assigned students', {
                rowCount: res.rows.length,
                query: "getGuardianStudents",
                rows: res.rows
            })

            if(res.rows.length === 0){
                return []
            }
            return res.rows; 
        } catch (err) {
            logError(`Error getting students for guardian ${guardianId}`, err);
            throw err;
        } finally {
            client.release();
        }
    }

    async getAvailableGuardianStudents(guardianId: number): Promise<Student[]> {
        const client = await pool.connect()
        try {
            const students = await client.query(`SELECT * FROM students`)
            const assignedStudents = await client.query(`SELECT student_id FROM student_guardians WHERE guardian_id=$1`,
                [guardianId])
            const studentIds: number[] = assignedStudents.rows.map(row => row.student_id)

            const availableStudents = students.rows.filter((student) => {
                return !studentIds.includes(student.student_id)
            })

            logger.debug('DB: Get guardian unassigned students', {
                rowCount: availableStudents.length,
                query: "getAvailabaleGuardianStudents",
                rows: availableStudents
            })
            if(!availableStudents || availableStudents.length === 0){
                return []
            }
            return availableStudents
        }catch(err) {
            logError("Error getting filtered students", err)
            throw err
        }finally {
            client.release()
        }
    }

    async getGuardianAddress(guardianId: number): Promise<Address> {
        const client = await pool.connect()
        try {
            const res = await client.query('SELECT a.street, a.city, a.province, a.postal_code FROM addresses a JOIN guardians g USING(address_id) WHERE g.guardian_id=$1',
                [guardianId]
            )
            logger.debug('DB: Get guardian address', {
                rowCount: res.rows.length,
                query: "getGuardianAddress",
                rows: res.rows
            })
            if (res.rows.length === 0) {
                return null
            }
            
            return res.rows[0]
        }catch(err){
            logError(`Error getting address for guardian ${guardianId}`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async updateGuardianAddress(guardianId: number, address: Address): Promise<void> {
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
                FROM guardians g
                WHERE g.address_id = a.address_id
                    AND guardian_id = $5
                RETURNING *
                `,
                [address.street, address.city, address.province, address.postalCode, guardianId]
            )
            logger.debug('DB: Update guardian address', {
                rowCount: res.rows.length,
                query: "updateGuardianAddress",
                rows: res.rows
            })
        } catch(err) {
            logError("Error updating guardian address", err)
            throw err
        } finally {
            client.release()
        }
    }

    async addGuardianAddress(guardianId: number, address: Address): Promise<void> {
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
                UPDATE guardians
                SET address_id=$1
                WHERE guardian_id=$2
                RETURNING *
                `,
                [newAddressId, guardianId]
            )
            logger.debug('DB: Add guardian address', {
                rowCount: updateRes.rows.length,
                query: "addGuardianAddress",
                rows: updateRes.rows
            })
            await client.query(`COMMIT`)
        }catch(err){
            await client.query(`ROLLBACK`)
            logError("Error adding guardian address", err)
            throw err        
        }finally {
            client.release()
        }
    }
}