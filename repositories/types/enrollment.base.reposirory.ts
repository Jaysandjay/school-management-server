import type { Enrollment } from "../../types/Enrollment";

export interface EnrollmentRepository {
    enrollStudent(studentId: number, classId: number): Promise<void>,
    setGrade(enrollment: Enrollment): Promise<void>,
    getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]>,
    getEnrollmentsByClass(classId: number): Promise<Enrollment[]>,
    unenrollStudent(studentId: number, classId: number): Promise<void>
}