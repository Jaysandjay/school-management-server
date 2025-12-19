import type { Attendance } from "../../types/Attendance"
import type { AttendanceStatus } from "../../types/AttendanceStatus"

export interface AttendanceRepository {
    getAttendanceBySession(sessionId: number): Promise<Attendance[]>,
    getAttendanceByStudent(studentId: number, class_id: number): Promise<Attendance[]>,
    markAttendance(attendance: Attendance): Promise<void>,
    updateAttendance(studentId: number, sessionId: number, status: AttendanceStatus): Promise<void>,
    deleteAttendance(studentId: number, sessionId: number): Promise<void>
}