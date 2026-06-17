
import { SetAppState } from "../interface"
import { GameDatetimeState } from "./interface"


export function initial_state(set_state: SetAppState): GameDatetimeState
{
    return {
        datetime: new Date("2026-06-17T14:00:00Z"),
        speed: "normal",
        set_datetime: (new_datetime: Date) =>
        {
            set_state(state =>
            {
                state.game_datetime.datetime = new_datetime
            })
        },
        set_speed: (new_speed: "paused" | "normal" | "fast") =>
        {
            set_state(state =>
            {
                state.game_datetime.speed = new_speed
            })
        },
    }
}
