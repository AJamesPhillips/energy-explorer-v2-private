
import { SetAppState } from "../interface"
import { CapacityFactorsAggregation, CapacityFactorsSource, ViewState } from "./interface"


export function initial_state(set_state: SetAppState): ViewState
{
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
    }
}
