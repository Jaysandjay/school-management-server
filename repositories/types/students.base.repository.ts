import { Address } from "../../types/Address";
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
    getStudentAddress(studentId: number): Promise<Address>,
    addStudentAddress(studentId: number, address: Address): Promise<void>,
    updateStudentAddress(studentId: number, address: Address): Promise<void>,
    deleteStudentAddress(studentId: number): Promise<void>
}