
import { sim_clock } from "../../sim_3d/state/sim_clock"
import { SetAppState } from "../interface"
import { DEFAULT_SPEED } from "./constants"
import { GameDatetimeState, GameSpeed } from "./interface"


export function initial_state(set_state: SetAppState): GameDatetimeState
{
    return {
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
