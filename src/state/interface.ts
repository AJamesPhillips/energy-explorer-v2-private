import type { Mutate, StoreApi } from "zustand/vanilla"

import { BuildingActionState } from "./building_action/interface"
import { PowerDemandState } from "./power_demand/interface"


export interface AppState
{
    building_action: BuildingActionState
    power_demand: PowerDemandState
}

type ImmerStore = Mutate<StoreApi<AppState>, [["zustand/immer", never]]>
export type SetAppState = ImmerStore["setState"]
export type GetAppState = ImmerStore["getState"]
