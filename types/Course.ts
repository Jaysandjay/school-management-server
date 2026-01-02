
export interface Course {
    classId?: number,
    className: string,
    gradeLevel: number,
    numStudents?: number,
    capacity?: number,
    isFull?: boolean,
    teacherId?: number
}