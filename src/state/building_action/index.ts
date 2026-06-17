
import { SetAppState } from "../interface"
import { ActiveBuildingAction, BuildingActionState } from "./interface"


export function initial_state(set_state: SetAppState): BuildingActionState
{
    return {
        active: { type: "wind" },
        set_building_action: (build_action: ActiveBuildingAction) =>
        {
            set_state(state =>
            {
                state.building_action.active = build_action
                if (!build_action) state.building_action.map_capacity_factors = false
                else if (build_action.type === "wind")
                {
                    state.building_action.map_capacity_factors = {
                        source: "wind",
                        aggregation: "hourly",
                    }
                }
                else if (build_action.type === "solar")
                {
                    state.building_action.map_capacity_factors = {
                        source: "solar_pv",
                        aggregation: "hourly",
                    }
                }
            })
        },
        map_capacity_factors: {
            source: "wind",
            aggregation: "hourly",
        },
    }
}
