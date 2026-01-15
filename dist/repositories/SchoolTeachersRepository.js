"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolTeachersRepository = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: 'postgresql://admin:admin123@localhost:5432/school_db' });
class SchoolTeachersRepository {
    async getTeachers() {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM teachers');
            console.log(res.rows);
            return res.rows;
        }
        catch (err) {
            console.error("Error fetching teachers", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async getTeacher(teacherId) {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM teachers WHERE teacher_id = $1', [teacherId]);
            if (res.rowCount === 0) {
                throw new Error("Teacher Does not Exist");
            }
            console.log(res.rows[0]);
            return res.rows[0];
        }
        catch (err) {
            console.error("Error getting Teacher", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async addTeacher(teacherData) {
        const client = await pool.connect();
        try {
            const res = await client.query('INSERT INTO teachers(first_name, last_name, email, phone) VALUES($1, $2, $3, $4) RETURNING *', [teacherData.firstName, teacherData.lastName, teacherData.email, teacherData.phone]);
            console.log("Teacher Added:", res.rows[0]);
        }
        catch (err) {
            console.error("Error adding Teacher", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async updateTeacher(teacherId, updatedTeacherInfo) {
        const client = await pool.connect();
        try {
            const res = await client.query('UPDATE teachers SET first_name=$1, last_name=$2, email=$3, phone=$4 WHERE teacher_id=$5 RETURNING *', [
                updatedTeacherInfo.firstName,
                updatedTeacherInfo.lastName,
                updatedTeacherInfo.email,
                updatedTeacherInfo.phone,
                teacherId
            ]);
            console.log("Teacher updated", res.rows[0]);
        }
        catch (err) {
            console.error(`Error updating Teacher ${teacherId}`, err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async deleteTeacher(teacherId) {
        const client = await pool.connect();
        try {
            const res = await client.query('DELETE FROM teachers WHERE teacher_id = $1', [teacherId]);
            if (res.rowCount === 0) {
                throw new Error(`Error deleting, teacher ${teacherId} does not exist`);
            }
            console.log(`Deleted teacher ${teacherId}`);
        }
        catch (err) {
            console.error(`Failed to delete teacher with id: ${teacherId}`, err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async getTeacherAddress(teacherId) {
        const client = await pool.connect();
        try {
            const res = await client.query(`
                    SELECT 
                        a.street, 
                        a.city, 
                        a.province, 
                        a.postal_code 
                    FROM addresses a JOIN teachers t USING(address_id) WHERE t.teacher_id=$1
                    `, [teacherId]);
            console.log("Teacher address", res.rows[0]);
            if (res.rows.length === 0) {
                return null;
            }
            return res.rows[0];
        }
        catch (err) {
            console.error(`Error getting address for teacher ${teacherId}`, err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async addTeacherAddress(teacherId, address) {
        const client = await pool.connect();
        try {
            await client.query(`BEGIN`);
            const res = await client.query(`
                    INSERT INTO addresses (street, city, province, postal_code)
                    values($1, $2, $3, $4)
                    RETURNING address_id
                    `, [address.street, address.city, address.province, address.postalCode]);
            const newAddressId = res.rows[0].address_id;
            await client.query(`
                    UPDATE teachers
                    SET address_id=$1
                    WHERE teacher_id=$2
                    `, [newAddressId, teacherId]);
            await client.query(`COMMIT`);
        }
        catch (err) {
            await client.query(`ROLLBACK`);
            console.error("Error adding teacher address", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async updateTeacherAddress(teacherId, address) {
        const client = await pool.connect();
        try {
            const res = await client.query(`
                        UPDATE addresses a 
                        SET 
                            street=$1,
                            city=$2,
                            province=$3,
                            postal_code=$4
                        FROM teachers t
                        WHERE t.address_id = a.address_id
                            AND teacher_id = $5
                        `, [address.street, address.city, address.province, address.postalCode, teacherId]);
        }
        catch (err) {
            console.error("Error updating teacher address", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async getTeacherClasses(teacherId) {
        const client = await pool.connect();
        try {
            const res = await client.query(`
                    SELECT *
                    FROM classes
                    WHERE teacher_id=$1
                    `, [teacherId]);
            if (res.rows.length === 0) {
                return [];
            }
            return res.rows;
        }
        catch (err) {
            console.error("Error getting teacher classes", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
}
exports.SchoolTeachersRepository = SchoolTeachersRepository;
