import type { Province } from "./Province"

export interface Address {
    addressId?: number,
    street: string,
    city: string,
    province: Province,
    postalCode: string
}