

export interface DemandForCell
{
    h3r4_id: string
    proportional_demand: number
    demand_gw: number
}

export type DemandByH3R4Cell = Record<string, DemandForCell>
