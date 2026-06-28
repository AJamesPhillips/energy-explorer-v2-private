import type { Mutate, StoreApi } from "zustand/vanilla"

import { BuildingActionState } from "./building_action/interface"
import { DataState } from "./data/interface"
import { GameDatetimeState } from "./game_datetime/interface"
import { LandCoverageState } from "./land_coverage/interface"
import { PowerDemandState } from "./power_demand/interface"
import { PowerPlantsState } from "./power_plants/interface"
import { ViewState } from "./view/interface"


export interface AppState
{
    building_action: BuildingActionState
    data: DataState
    game_datetime: GameDatetimeState
    land_coverage: LandCoverageState
    power_demand: PowerDemandState
    power_plants: PowerPlantsState
    view: ViewState
}

type ImmerStore = Mutate<StoreApi<AppState>, [["zustand/immer", never]]>
export type SetAppState = ImmerStore["setState"]
export type GetAppState = ImmerStore["getState"]
export type Subscribe = (subscriber: (state: AppState, previous_state: AppState) => void) => () => void
