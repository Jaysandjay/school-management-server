import { AttendanceRepository } from "./repositories/types/attendance.base.repository";
import { ClassesRepository } from "./repositories/types/classes.base.repository";
import { ClassSessionRepository } from "./repositories/types/classSessions.base.repository";
import { EnrollmentRepository } from "./repositories/types/enrollment.base.reposirory";

import express from "express";
import cors from "cors";
import logger from "./middleware/logger";
import { createClassRouter } from "./routes/classes.routes";
import { SchoolClassesRepository } from "./repositories/SchoolClassesRepository";
import { Pool } from "pg";
import { createTeacherRouter } from "./routes/teachers.routes";
import { TeachersRepository } from "./repositories/types/teachers.base.repository";
import { SchoolTeachersRepository } from "./repositories/SchoolTeachersRepository";
import { StudentRepository } from "./repositories/types/students.base.repository";
import { SchoolStudentsRepository } from "./repositories/SchoolStudentsRepository";
import { createStudentRouter } from "./routes/students.routes";
import { createGuardianRouter } from "./routes/guardians.routes";
import { GuardiansRepository } from "./repositories/types/guardians.base.repository";
import { SchoolGuardiansRepository } from "./repositories/SchoolGuardiansRepository";
import { createClassSessionRouter } from "./routes/classSessions.routes";
import { SchoolClassSessionsRepository } from "./repositories/SchoolClassSessionsRepository";
import { createAttendanceRouter } from "./routes/attendance.routes";
import {SchoolAttendanceRepository} from "./repositories/SchoolAttendanceRepository"
import { createEnrollmentRouter } from "./routes/enrollments.routes";
import { SchoolEnrollmentsRepository } from "./repositories/SchoolEnrollmentsRepository";


async function main(
    classRepository: ClassesRepository,
    teacherRepository: TeachersRepository,
    studentRepository: StudentRepository,
    guardianRepository: GuardiansRepository,
    classSessionRepository: ClassSessionRepository,
    attendanceRepository: AttendanceRepository,
    enrollmentRepository: EnrollmentRepository
){
    console.log("Server is running...")
    const port = 8000
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(cors())
    app.use(logger)

    //Routes
    app.use("/api/classes", createClassRouter(classRepository))
    app.use("/api/teachers", createTeacherRouter(teacherRepository))
    app.use("/api/students", createStudentRouter(studentRepository))
    app.use("/api/guardians", createGuardianRouter(guardianRepository))
    app.use("/api/sessions", createClassSessionRouter(classSessionRepository))
    app.use("/api/attendance", createAttendanceRouter(attendanceRepository))
    app.use("/api/enrollments", createEnrollmentRouter(enrollmentRepository))


    //Check Connection
    try {
        const pool = new Pool({connectionString: 'postgresql://admin:admin123@localhost:5432/school_db'})
        await pool.query("SELECT 1")
        console.log("Database connected successfully!");
  } catch (err) {
    console.error("Cannot connect to database:", err);
    process.exit(1); 
  }
    

    app.listen(port, "0.0.0.0", ()=> console.log(`Server is running on port ${port}`))
}
(async () => {
    const classRepository = new SchoolClassesRepository()
    const teacherRepository = new SchoolTeachersRepository()
    const studentRepository = new SchoolStudentsRepository()
    const guardianRepository = new SchoolGuardiansRepository()
    const classSessionRepository = new SchoolClassSessionsRepository()
    const attendanceRepository = new SchoolAttendanceRepository()
    const enrollmentRepository = new SchoolEnrollmentsRepository()
    await main(
        classRepository,
        teacherRepository,
        studentRepository,
        guardianRepository,
        classSessionRepository,
        attendanceRepository,
        enrollmentRepository
    )
})()