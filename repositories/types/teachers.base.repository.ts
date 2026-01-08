import { Address } from "../../types/Address"
import { Course } from "../../types/Course"
import type { Teacher } from "../../types/Teacher"

export interface TeachersRepository {
    getTeachers(): Promise<Teacher[]>,
    getTeacher(teacherId: number): Promise<Teacher>,
    addTeacher(teacherData: Teacher): Promise<void>,
    updateTeacher(teacherId: number, updatedTeacherInfo: Teacher): Promise<void>,
    deleteTeacher(teacherId: number): Promise<void>,
    addTeacherAddress(teacherId: number, address: Address): Promise<void>,
    getTeacherAddress(teacherId: number): Promise<Address>,
    updateTeacherAddress(teacherId: number, address: Address): Promise<void>,
    getTeacherClasses(teacherId: number): Promise<Course[]>,
}