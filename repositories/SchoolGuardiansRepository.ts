import type { Guardian } from "../types/Guardian";
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
}