import type { Mutate, StoreApi } from "zustand/vanilla"

import { BuildingActionState } from "./building_action/interface"
import { GameDatetimeState } from "./game_datetime/interface"
import { PowerDemandState } from "./power_demand/interface"
import { ViewState } from "./view/interface"


export interface AppState
{
    building_action: BuildingActionState
    game_datetime: GameDatetimeState
    power_demand: PowerDemandState
    view: ViewState
}

type ImmerStore = Mutate<StoreApi<AppState>, [["zustand/immer", never]]>
export type SetAppState = ImmerStore["setState"]
export type GetAppState = ImmerStore["getState"]
