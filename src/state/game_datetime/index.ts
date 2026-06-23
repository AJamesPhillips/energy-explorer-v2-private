
import { sim_clock } from "../../sim_3d/state/sim_clock"
import type { AppState, SetAppState } from "../interface"
import { DEFAULT_SPEED } from "./constants"
import { GameDatetimeState, GameSpeed } from "./interface"


export function initial_state(set_state: SetAppState, get_state: () => AppState): GameDatetimeState
{
    return {
        start_timestamp: new Date("2026-06-01T00:00:00.000Z").getTime(),
        initial_timestamp: new Date("2026-06-01T09:00:00.000Z").getTime(),
        end_timestamp: new Date("2026-06-15T00:00:00.000Z").getTime(),
        get_year: () =>
        {
            const start_timestamp = get_state().game_datetime.start_timestamp
            return new Date(start_timestamp).getUTCFullYear()
        },

        speed: DEFAULT_SPEED,
        set_speed: (new_speed: GameSpeed) =>
        {
            set_state(state =>
            {
                state.game_datetime.speed = new_speed
            })
            sim_clock.set_speed(new_speed)
        },
    }
}
