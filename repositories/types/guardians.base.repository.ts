import type { Guardian } from "../../types/Guardian";

export interface GuardiansRepository {
    getGuardians(): Promise<Guardian[]>,
    addGuardian(guardianInfo: Guardian): Promise<void>,
    deleteGuardian(guardianId: number): Promise<void>,
    getGuardian(guardianId: number): Promise<Guardian>
}