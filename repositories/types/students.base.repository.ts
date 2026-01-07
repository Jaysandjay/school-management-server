import { Address } from "../../types/Address";
import { Course } from "../../types/Course";
import { Guardian } from "../../types/Guardian";
import { GuardianRelationship } from "../../types/GuardianRelationship";
import type { Student } from "../../types/Student";

export interface StudentRepository {
    getStudents(): Promise<Student[]>,
    getStudent(studentId: number): Promise<Student>,
    addStudent(studentInfo: Student): Promise<void>,
    updateStudent(studentId: number, studentInfo: Student): Promise<void>,
    deleteStudent(studentId: number): Promise<void>,
    assignStudentGuardian(studentId: number, guardianId: number, relationship: GuardianRelationship): Promise<void>,
    deleteStudentGuardian(studentId: number, guardianId: number): Promise<void>,
    getStudentGuardians(studentdId: number): Promise<Guardian[]>,
    getStudentAvailableGuardians(studentId: number): Promise<Guardian[]>,
    getStudentAddress(studentId: number): Promise<Address>,
    addStudentAddress(studentId: number, address: Address): Promise<void>,
    updateStudentAddress(studentId: number, address: Address): Promise<void>,
    getStudentsClasses(studentId: number): Promise<Course[]>,
    getAvailableStudentClasses(studentId: number): Promise<Course[]>,
    getStudentsClasses(studentId: number): Promise<Course[]>,
    unenrollStudent(studentId: number, classId: number): Promise<void>,
    enrollStudent(studentId: number, classId: number): Promise<void>,
}