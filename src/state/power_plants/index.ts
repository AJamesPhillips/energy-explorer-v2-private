
import { aggregate_power_plants_by_h3_cell, initial_power_plants_data, map_power_plants_by_h3_cell } from "../../sim_3d/data/power_plants"
import { AggregatedPowerPlantData } from "../../sim_3d/data/power_plants/interface"
import { promise_load_all_capacity_factor_data } from "../../sim_3d/data/wind_and_solar_capacity/load_data"
import { AppState, SetAppState } from "../interface"
import { PowerPlantsState } from "./interface"


export function initial_state(set_state: SetAppState, get_state: () => AppState): PowerPlantsState
{
    const set_aggregated_by_h3r4 = (aggregated_by_h3r4: Record<string, AggregatedPowerPlantData>) =>
    {
        set_state(state =>
        {
            state.power_plants.aggregated_by_h3r4 = aggregated_by_h3r4
        })
    }

    promise_load_all_capacity_factor_data().then(({ wind, solar }) =>
    {
        const power_plants_by_h3r4_cell = get_state().power_plants.all_by_h3r4_cell
        const aggregated_by_h3r4 = aggregate_power_plants_by_h3_cell(power_plants_by_h3r4_cell, wind, solar)
        set_aggregated_by_h3r4(aggregated_by_h3r4)
    })


    return {
        all: initial_power_plants_data,
        all_by_h3r4_cell: map_power_plants_by_h3_cell(initial_power_plants_data),
        aggregated_by_h3r4: undefined,
        set_aggregated_by_h3r4,
    }
}
