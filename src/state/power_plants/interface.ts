import { AggregatedPowerPlantData } from "../../sim_3d/data/power_plants/interface"
import { PowerType } from "../../sim_3d/model/interface"


export interface PowerPlantsState
{
    // all: PowerPlant[]
    // all_by_h3r4_cell: Record<string, PowerPlant[]>
    aggregated_by_h3r4: Record<string, AggregatedPowerPlantData> | undefined
    set_aggregated_by_h3r4: (aggregated_by_h3r4: Record<string, AggregatedPowerPlantData>) => void

    update_build_action: (build_action: BuildAction) => void
}


export interface BuildAction
{
    h3r4_id: string
    power_type: PowerType
    area_addable_km2: number
    aggregated: AggregatedPowerPlantData
}
