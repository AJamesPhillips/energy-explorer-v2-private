import { AggregatedPowerPlantData, PowerPlant } from "../../sim_3d/data/power_plants/interface"


export interface PowerPlantsState
{
    all: PowerPlant[]
    all_by_h3r4_cell: Record<string, PowerPlant[]>
    aggregated_by_h3r4: Record<string, AggregatedPowerPlantData> | undefined
    set_aggregated_by_h3r4: (aggregated_by_h3r4: Record<string, AggregatedPowerPlantData>) => void
}
