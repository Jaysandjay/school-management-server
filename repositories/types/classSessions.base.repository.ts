import { ClassSession } from "../../types/ClassSession";

export interface ClassSessionRepository {
    scheduleSession(session: ClassSession): Promise<void>,
    getSessionsByClass(classId: number): Promise<ClassSession[]>,
    updateSession(sessionId: number, sessionInfo: ClassSession): Promise<void>,
}