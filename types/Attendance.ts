import type { AttendanceStatus } from "./AttendanceStatus"

export interface Attendance {
    studentId: number,
    sessionId: number,
    status: AttendanceStatus,
    recordedAt?: Date
}