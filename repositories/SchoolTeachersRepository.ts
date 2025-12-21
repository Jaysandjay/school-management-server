import type  { Teacher } from "../types/Teacher";
import { TeachersRepository } from "./types/teachers.base.repository";
import { Pool } from "pg";

const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})

export class SchoolTeachersRepository implements TeachersRepository {

    async getTeachers(): Promise<Teacher[]> {
        const client = await pool.connect()
        try{
            const res = await client.query('SELECT * FROM teachers')
            console.log(res.rows)
            return res.rows
        }catch(err){
            console.error("Error fetching teachers", err)
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
                throw new Error("Teacher Does not Exist")
            }
            console.log(res.rows[0])
            return res.rows[0]
        }catch(err){
            console.error("Error getting Teacher", err) 
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
            console.log("Teacher Added:", res.rows[0])
        }catch(err){
            console.error("Error adding Teacher", err)
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
            console.log("Teacher updated", res.rows[0])
        }catch(err){
            console.error(`Error updating Teacher ${teacherId}` , err)
            throw err
        }finally{
            client.release()
        }
    }

    async deleteTeacher(teacherId: number): Promise<void> {
        const client = await pool.connect()
        try{
            const res = await client.query('DELETE FROM teachers WHERE teacher_id = $1',
                [teacherId]
            )
            if(res.rowCount === 0){
                throw new Error(`Error deleting, teacher ${teacherId} does not exist`)
            }
            console.log(`Deleted teacher ${teacherId}`)
        }catch(err){
            console.error(`Failed to delete teacher with id: ${teacherId}`, err)
            throw err
        }finally{
            client.release()
        }
    }
}