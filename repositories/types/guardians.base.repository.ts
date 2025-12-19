import type { Guardian } from "../types/Guardian";

export interface GuardiansRepository {
    addGuardian(guardianInfo: Guardian): Promise<void>,
    deleteGuardian(guardianId: number): Promise<void>,
    getGuardian(guardianId: number): Promise<Guardian>
}