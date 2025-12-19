export interface ClassSession {
    session_id?: number
    classId: number,
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday",
    startTime: string,
    endTime: string
}