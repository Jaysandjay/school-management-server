import type { Course } from "../../types/Course"
import { Student } from "../../types/Student"
export interface ClassesRepository {
    getClass(classId: number): Promise<Course>,
    getStudentsClasses(studentId: number): Promise<Course[]>,
    getTeachersClasses(teacherId: number): Promise<Course[]>,
    addClass(className: string) :Promise<void>,
    deleteClass(classId: number): Promise<void>,
    assignTeacherToClass(classId: number, teacherId: number): Promise<void>,
    getClassEnrollments(classId: number): Promise<Student[]>
}