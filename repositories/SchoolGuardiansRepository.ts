import { Address } from "../types/Address";
import type { Guardian } from "../types/Guardian";
import { Student } from "../types/Student";
import { GuardiansRepository } from "./types/guardians.base.repository";
import { Pool } from "pg";

const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})

export class SchoolGuardiansRepository implements GuardiansRepository {
    async getGuardians(): Promise<Guardian[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM guardians')
            console.log(res.rows)
            return res.rows
        }catch(err){
            console.error("Error fetching guardians", err)
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
            if(res.rowCount === 0){
                throw new Error(`Error, Guardian ID ${guardianId} Does not Exist`)
            }
            return res.rows[0]
        }catch(err){
            console.error('Error getting Guardian', err)
            throw err
        }finally{
            client.release()
        }
    }

    async addGuardian(guardianInfo: Guardian): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query('INSERT INTO guardians(first_name, last_name, phone, email) VALUES($1, $2,  $3, $4)', 
                [guardianInfo.firstName, guardianInfo.lastName, guardianInfo.phone, guardianInfo.email]
            )
            console.log(`Created guardian:`, res.rows[0])
        }catch(err){
            console.error(`Error creating guardian`, err)
            throw err
        }finally{
            client.release()
        }
    }

    async updateGuardian(guardianId: number, updatedGuardian: Guardian): Promise<void> {
        const client = await pool.connect()
        try {
            const res = await client.query(`UPDATE guardians SET first_name=$1, last_name=$2, phone=$3, email=$4 WHERE guardian_id=$5`,
                [updatedGuardian.firstName, updatedGuardian.lastName, updatedGuardian.phone, updatedGuardian.email, guardianId]
            )
        }catch(err){
            console.error("Error updating guardian", err)
            throw err
        }finally {
            client.release()
        }
    }

    async deleteGuardian(guardianId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM guardians WHERE guardian_id = $1',
                [guardianId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error deleting, Guardian ${guardianId} does not exits`)
            }
            console.log(`Guardian ${guardianId} deleted`)
        }catch(err){
            console.error(`Failed to delete guardian with id: ${guardianId}`, err)
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
          
            console.log("Students", res.rows)

            if(res.rows.length === 0){
                return []
            }
            return res.rows; 
        } catch (err) {
            console.error(`Error getting students for guardian ${guardianId}`, err);
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
            if(!availableStudents || availableStudents.length === 0){
                return []
            }
            console.log(`Guardian ${guardianId} available students:`, availableStudents)
            return availableStudents
        }catch(err) {
            console.error("Error getting filtered studednts", err)
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
            console.log("Guardian address", res.rows[0])
            if (res.rows.length === 0) {
                return null
            }
            
            return res.rows[0]
        }catch(err){
            console.error(`Error getting address for guardian ${guardianId}`, err)
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
                `,
                [address.street, address.city, address.province, address.postalCode, guardianId]
            )
        } catch(err) {
            console.error("Error updating guardian address", err)
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

            await client.query(
                `
                UPDATE guardians
                SET address_id=$1
                WHERE guardian_id=$2
                `,
                [newAddressId, guardianId]
            )
            await client.query(`COMMIT`)
        }catch(err){
            await client.query(`ROLLBACK`)
            console.error("Error adding guardian address", err)
            throw err        
        }finally {
            client.release()
        }
    }
}