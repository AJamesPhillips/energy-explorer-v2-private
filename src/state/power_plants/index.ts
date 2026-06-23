
import { aggregate_power_plants_by_h3_cell, initial_power_plants_data, map_power_plants_by_h3_cell } from "../../sim_3d/data/power_plants"
import { AggregatedPowerPlantData } from "../../sim_3d/data/power_plants/interface"
import { promise_load_all_capacity_factor_data } from "../../sim_3d/data/wind_and_solar_capacity/load_data"
import { AppState, SetAppState } from "../interface"
import { PowerPlantsState } from "./interface"


export function initial_state(set_state: SetAppState, _get_state: () => AppState): PowerPlantsState
{
    const initial_all_by_h3r4_cell = map_power_plants_by_h3_cell(initial_power_plants_data)
    const set_aggregated_by_h3r4 = (aggregated_by_h3r4: Record<string, AggregatedPowerPlantData>) =>
    {
        set_state(state =>
        {
            state.power_plants.aggregated_by_h3r4 = aggregated_by_h3r4
        })
    }

    promise_load_all_capacity_factor_data().then(({ wind, solar }) =>
    {
        const aggregated_by_h3r4 = aggregate_power_plants_by_h3_cell(initial_all_by_h3r4_cell, wind, solar)
        set_aggregated_by_h3r4(aggregated_by_h3r4)
    })


    return {
        // all: initial_power_plants_data,
        // all_by_h3r4_cell: map_power_plants_by_h3_cell(initial_power_plants_data),
        aggregated_by_h3r4: undefined,
        set_aggregated_by_h3r4,

        update_build_action: build_action =>
        {
            set_state(state =>
            {
                if (!state.power_plants.aggregated_by_h3r4)
                {
                    console.warn(`update_build_action: no existing aggregated data`)
                    return
                }

                let existing_cell = state.power_plants.aggregated_by_h3r4[build_action.h3r4_id]
                if (!existing_cell)
                {
                    state.power_plants.aggregated_by_h3r4[build_action.h3r4_id] = build_action.aggregated
                    existing_cell = state.power_plants.aggregated_by_h3r4[build_action.h3r4_id]!
                }

                const existing_power_type = existing_cell[build_action.power_type]
                if (existing_power_type.starting_area_km2 === undefined)
                {
                    console.warn(`update_build_action: no starting area for h3r4_id ${build_action.h3r4_id} and power type ${build_action.power_type}`)
                    return
                }

                const area_km2 = (
                    (existing_power_type.area_km2 || 0) + build_action.area_addable_km2
                )
                existing_power_type.area_km2 = area_km2

                existing_power_type.capacity_MW = area_km2 * MW_per_km2_for_power_type(build_action.power_type, area_km2)
                existing_power_type.count += 1
                // state.power_plants.aggregated_by_h3r4[build_action.h3r4_id] = {
                //     ...existing_aggregated,
                // }
            })
        }
    }
}


function MW_per_km2_for_power_type(power_type: string, _area_km2: number): number
{
    if (power_type === "wind") return 1 // area_km2 should decrease as wind farms get larger
    if (power_type === "solar") return 5
    return 0
}
