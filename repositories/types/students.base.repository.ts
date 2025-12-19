import type { Student } from "../../types/Student";

export interface StudentRepository {
    getStudent(studentId: number): Promise<Student>,
    addStudent(studentInfo: Student): Promise<void>,
    deleteStudent(studentId: number): Promise<void>,
    assignStudentGuardian(studentId: number, guardianId: number): Promise<void>
}