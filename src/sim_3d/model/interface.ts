

export interface DemandGWForH3R4
{
    h3r4_id: string
    proportional_demand: number
    demand_GW: number
}

export type DemandByH3R4Cell = Record<string, DemandGWForH3R4>

export interface ValueByPowerType<V>
{
    wind: V
    solar: V
    gas: V
    nuclear: V
    hydro_RoR: V
    battery: V
    hydro_pumped_storage: V
}

export const POWER_TYPES = [
    "wind",
    "solar",
    "gas",
    "nuclear",
    "hydro_RoR",
    "battery",
    "hydro_pumped_storage",
] as const

export type MWGenCapStore = { generated_MW: number; capacity_MW: number }
export type MWGenCapStoreForH3R4 = {
    h3r4_id: string
    total_generated_MW: number
    total_capacity_MW: number
} & ValueByPowerType<MWGenCapStore>
