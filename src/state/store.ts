import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

import { deep_copy } from "core/utils/deep_copy"
import { deep_freeze } from "core/utils/deep_freeze"

import * as building_action from "./building_action"
import { AppState } from "./interface"
import * as power_demand from "./power_demand"


export type AppStore = ReturnType<typeof get_new_app_store>


// Wrapped the Zustand store creation in a function to allow for testing and
// resetting.
// This allows us to create a fresh store instance for each test or reset
// without affecting the global state.
export const get_new_app_store = () =>
{
    const app_store = create<AppState>()(immer((set_state, _get_state) =>
    {
        return {
            building_action: building_action.initial_state(set_state),
            power_demand: power_demand.initial_state(set_state),
        }
    }))

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


// Wrapped the store in a function to allow for lazy initialization.
// This allows us to create the store only when it's needed, which would allow
// us to stub out the calls to supabase in tests, for example.
let _app_store: AppStore | undefined = undefined
export const get_app_state = () =>
{
    if (_app_store) return _app_store()
    _app_store = get_new_app_store()

    return _app_store()
}
