

export interface DemandForCell
{
    h3r4_id: string
    proportional_demand: number
    demand_gw: number
}

export type DemandByH3R4Cell = Record<string, DemandForCell>

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

export type GenerationBySource = { generated_mw: number; capacity_mw: number }
export type GenerationByCell = {
    h3_id: string
    total_generated_mw: number
    total_capacity_mw: number
} & ValueByPowerType<{ generated_mw: number; capacity_mw: number }>
