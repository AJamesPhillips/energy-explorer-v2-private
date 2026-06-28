import { get_initial_proportional_demand_by_h3r4_cell } from "../../sim_3d/data/power_demand/demand_by_h3r4_cell"
import { SetAppState, Subscribe } from "../interface"
import { PowerDemandState } from "./interface"


export function initial_state(set_state: SetAppState, subscribe: Subscribe): PowerDemandState
{
    subscribe((state, previous_state) =>
    {
        if (state.land_coverage.h3r5_land_cells === previous_state.land_coverage.h3r5_land_cells) return

        const initial_electricity_demand_GW_by_h3r4 = get_initial_proportional_demand_by_h3r4_cell(state.land_coverage.h3r5_land_cells)
        set_state(state =>
        {
            state.power_demand.initial_electricity_demand_GW_by_h3r4 = initial_electricity_demand_GW_by_h3r4
        })
    })

    return {
        initial_electricity_demand_GW_by_h3r4: undefined,
        // electricity_demand_gw: 0,
        // gas_demand_gw: 0,
        // petrol_demand_gw: 0,
        // diesel_demand_gw: 0,
        // jet_fuel_demand_gw: 0,
        // heating_oil_demand_gw: 0,
    }
}
