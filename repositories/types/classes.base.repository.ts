import type { Course } from "../../types/Course"
import { Student } from "../../types/Student"
import { Teacher } from "../../types/Teacher"
export interface ClassesRepository {
    getClasses(): Promise<Course[]>,
    getClass(classId: number): Promise<Course>,
    addClass(course: Course) :Promise<void>,
    updateClass(classId: number, updatedClass: Course): Promise<void>,
    deleteClass(classId: number): Promise<void>,
    assignTeacherToClass(classId: number, teacherId: number): Promise<void>,
    removeTeacherFromClass(classId: number): Promise<void>,
    getClassTeacher(classId: number): Promise<Teacher>,
    getClassStudents(classId: number): Promise<Student[]>,
    getClassAvailableStudents(classId: number): Promise<Student[]>
}