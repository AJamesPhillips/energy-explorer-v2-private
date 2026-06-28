

export interface DemandGWForH3R4
{
    h3r4_id: string
    proportional_demand: number
    demand_GW: number
}

export type DemandByH3R4Cell = Record<string, DemandGWForH3R4>

export const STORAGE_TYPES = [
    "battery",
    "hydro_pumped_storage",
] as const
export const POWER_TYPES = [
    "wind",
    "solar",
    "gas",
    "nuclear",
    "hydro_river",
    ...STORAGE_TYPES,
] as const
export type StorageType = (typeof STORAGE_TYPES)[number]
export type PowerType = (typeof POWER_TYPES)[number]
export type ValueByStorageType<V> = Record<StorageType, V>
export type ValueByPowerType<V> = Record<PowerType, V>

interface MWGenCapStore {
    generated_MW: number
    capacity_MW: number
    stored_MWh?: number
    store_capacity_MWh?: number
}
export type MWGenCapStoreForH3R4 = {
    h3r4_id: string
    total_generated_MW: number
    total_capacity_MW: number
} & ValueByPowerType<MWGenCapStore>
