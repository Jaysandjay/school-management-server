"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = __importDefault(require("./middleware/logger"));
const classes_routes_1 = require("./routes/classes.routes");
const SchoolClassesRepository_1 = require("./repositories/SchoolClassesRepository");
const pg_1 = require("pg");
const teachers_routes_1 = require("./routes/teachers.routes");
const SchoolTeachersRepository_1 = require("./repositories/SchoolTeachersRepository");
const SchoolStudentsRepository_1 = require("./repositories/SchoolStudentsRepository");
const students_routes_1 = require("./routes/students.routes");
const guardians_routes_1 = require("./routes/guardians.routes");
const SchoolGuardiansRepository_1 = require("./repositories/SchoolGuardiansRepository");
const SchoolClassSessionsRepository_1 = require("./repositories/SchoolClassSessionsRepository");
// import { SchoolEnrollmentsRepository } from "./repositories/SchoolEnrollmentsRepository";
const camelCaseResponse_1 = require("./middleware/camelCaseResponse");
async function main(classRepository, teacherRepository, studentRepository, guardianRepository) {
    console.log("Server is running...");
    const port = 8000;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cors_1.default)());
    app.use(logger_1.default);
    app.use(camelCaseResponse_1.convertToCamelCase);
    //Routes
    app.use("/api/classes", (0, classes_routes_1.createClassRouter)(classRepository));
    app.use("/api/teachers", (0, teachers_routes_1.createTeacherRouter)(teacherRepository));
    app.use("/api/students", (0, students_routes_1.createStudentRouter)(studentRepository));
    app.use("/api/guardians", (0, guardians_routes_1.createGuardianRouter)(guardianRepository));
    // app.use("/api/sessions", createClassSessionRouter(classSessionRepository))
    // app.use("/api/attendance", createAttendanceRouter(attendanceRepository))
    // app.use("/api/enrollments", createEnrollmentRouter(enrollmentRepository))
    //Check Connection
    try {
        const pool = new pg_1.Pool({ connectionString: 'postgresql://admin:admin123@localhost:5432/school_db' });
        await pool.query("SELECT 1");
        console.log("Database connected successfully!");
    }
    catch (err) {
        console.error("Cannot connect to database:", err);
        process.exit(1);
    }
    app.listen(port, "0.0.0.0", () => console.log(`Server is running on port ${port}`));
}
(async () => {
    const classRepository = new SchoolClassesRepository_1.SchoolClassesRepository();
    const teacherRepository = new SchoolTeachersRepository_1.SchoolTeachersRepository();
    const studentRepository = new SchoolStudentsRepository_1.SchoolStudentsRepository();
    const guardianRepository = new SchoolGuardiansRepository_1.SchoolGuardiansRepository();
    const classSessionRepository = new SchoolClassSessionsRepository_1.SchoolClassSessionsRepository();
    // const attendanceRepository = new SchoolAttendanceRepository() 
    // const enrollmentRepository = new SchoolEnrollmentsRepository()
    await main(classRepository, teacherRepository, studentRepository, guardianRepository);
})();
