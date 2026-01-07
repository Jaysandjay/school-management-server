import { Address } from "../../types/Address";
import type { Guardian } from "../../types/Guardian";
import { Student } from "../../types/Student";

export interface GuardiansRepository {
    getGuardians(): Promise<Guardian[]>,
    addGuardian(guardianInfo: Guardian): Promise<void>,
    updateGuardian(guardianId: number, updatedGuardian: Guardian): Promise<void>,
    deleteGuardian(guardianId: number): Promise<void>,
    getGuardian(guardianId: number): Promise<Guardian>,
    getGuardianStudents(guardianId: number): Promise<Student[]>,
    getAvailableGuardianStudents(guardianId: number): Promise<Student[]>,
    getGuardianAddress(guardianId: number): Promise<Address>,
    addGuardianAddress(guardianId: number, address: Address): Promise<void>,
    updateGuardianAddress(guardianId: number, address: Address): Promise<void>,
    updateGuardianAddress(guardianId: number, address: Address): Promise<void>,

}