
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
            })
        },
    }
}
