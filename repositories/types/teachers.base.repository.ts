import type { Teacher } from "../../types/Teacher"

export interface TeachersRepository {
    getTeachers(): Promise<Teacher[]>,
    getTeacher(teacherId: number): Promise<Teacher>,
    addTeacher(teacherData: Teacher): Promise<void>,
    updateTeacher(teacherId: number, updatedTeacherInfo: Teacher): Promise<void>,
    deleteTeacher(teacherId: number): Promise<void>
}