
import pub_sub from "../../sim_3d/state/pub_sub"
import { SetAppState } from "../interface"
import { CapacityFactorsAggregation, CapacityFactorsSource, ViewState } from "./interface"


export function initial_state(set_state: SetAppState): ViewState
{
    const set_cell_info_open = (h3r4_id: string | undefined) =>
    {
        set_state(state =>
        {
            if (state.view.h3r4_cell_info_open === h3r4_id
                // Do not close the cell info when building - multiple clicks on
                // the same cell is fine for incremental building of solar & wind
                && !state.building_action.active)
            {
                h3r4_id = undefined
            }
            state.view.h3r4_cell_info_open = h3r4_id
        })
    }

    pub_sub.sub("on_click_tile", payload =>
    {
        set_cell_info_open(payload.h3r4_id)
    })

    return {
        angle: "isometric",
        set_angle: (new_angle: "top_down" | "isometric" | "partial") =>
        {
            set_state(state =>
            {
                state.view.angle = new_angle
            })
        },
        map_capacity_factors_source: "wind",
        map_capacity_factors_aggregation: "hourly",
        map_capacity_factors_discrete: false,
        set_map_capacity_factors: (source: CapacityFactorsSource | undefined | false, aggregation?: CapacityFactorsAggregation, discrete?: boolean) =>
        {
            set_state(state =>
            {
                // If source is explicitly undefined then do nothing otherwise change it
                if (source !== undefined) state.view.map_capacity_factors_source = source
                if (aggregation !== undefined) state.view.map_capacity_factors_aggregation = aggregation
                if (discrete !== undefined) state.view.map_capacity_factors_discrete = discrete
            })
        },

        h3r4_cell_info_open: undefined,
        set_h3r4_cell_info_open: set_cell_info_open,
    }
}
