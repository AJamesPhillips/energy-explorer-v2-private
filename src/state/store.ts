import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

import { deep_copy } from "core/utils/deep_copy"
import { deep_freeze } from "core/utils/deep_freeze"

import { AggregatedPowerPlantData } from "../sim_3d/data/power_plants/interface"
import * as building_action from "./building_action"
import * as data from "./data"
import * as game_datetime from "./game_datetime"
import { AppState, Subscribe } from "./interface"
import * as power_demand from "./power_demand"
import * as power_plants from "./power_plants"
import * as view from "./view"


export type AppStore = ReturnType<typeof get_new_app_store>


// Wrapped the Zustand store creation in a function to allow for testing and
// resetting.
// This allows us to create a fresh store instance for each test or reset
// without affecting the global state.
export const get_new_app_store = () =>
{
    const subscribers: ((state: AppState, previous_state: AppState) => void)[] = []
    const subscribe: Subscribe = (subscriber: (state: AppState, previous_state: AppState) => void) =>
    {
        subscribers.push(subscriber)
        return () =>
        {
            const index = subscribers.indexOf(subscriber)
            if (index !== -1) subscribers.splice(index, 1)
        }
    }

    const app_store = create<AppState>()(immer((set_state, get_state) =>
    {
        return {
            building_action: building_action.initial_state(set_state),
            data: data.initial_state(set_state),
            game_datetime: game_datetime.initial_state(set_state, get_state),
            power_demand: power_demand.initial_state(set_state),
            power_plants: power_plants.initial_state(set_state, get_state),
            view: view.initial_state(set_state),
        }
    }))

    subscribers.forEach(subscriber => app_store.subscribe(subscriber))

    // Expose the store state for easier debugging
    app_store.subscribe((state, _previous_state) =>
    {
        // Don't run this in a non-browser environment
        if (typeof window === "undefined") return
        const copied_app_state = deep_copy(state)

        const frozen_debug_state = deep_freeze(copied_app_state)
        ;(window as any).debug_state = frozen_debug_state
    })

    return app_store
}

export function hacky_get_state(): AppState | undefined
{
    if ((window as any).debug_state) return (window as any).debug_state
}
export async function await_aggregated_by_h3r4(): Promise<Record<string, AggregatedPowerPlantData>>
{
    const aggregated_by_h3r4 = hacky_get_state()?.power_plants.aggregated_by_h3r4
    if (aggregated_by_h3r4) return aggregated_by_h3r4

    return new Promise((resolve, _reject) =>
    {
        const unsubscribe = get_app_store().subscribe((state) =>
        {
            if (state.power_plants.aggregated_by_h3r4)
            {
                resolve(state.power_plants.aggregated_by_h3r4)
                unsubscribe()
            }
        })
    })
}


// Wrapped the store in a function to allow for lazy initialization.
// This allows us to create the store only when it's needed, which would allow
// us to stub out the calls to supabase in tests, for example.
let _app_store: AppStore | undefined = undefined

// Accessor for the raw store instance (hook + store API). Lazily created.
export const get_app_store = () =>
{
    if (!_app_store) _app_store = get_new_app_store()
    return _app_store
}

// Hook usage: subscribe to store (or a selected slice).
export function get_app_state(): AppState
export function get_app_state<T>(selector: (state: AppState) => T, equality_func?: (a: T, b: T) => boolean): T
export function get_app_state(selector?: (state: AppState) => any, equality_func?: (a: any, b: any) => boolean)
{
    if (!_app_store) _app_store = get_new_app_store()

    // Forward to the zustand hook. If no selector is provided this subscribes
    // to the whole store (legacy behaviour). Prefer calling with a selector
    // to subscribe to only a slice: `get_app_state(s => s.game_datetime, shallow)`.
    if (selector === undefined) return _app_store()

    // @ts-ignore
    return _app_store(selector as any, equality_func as any)
}
