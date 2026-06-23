
export type GameSpeed = "paused" | "normal" | "fast"

export interface GameDatetimeState
{
    start_timestamp: number
    initial_timestamp: number
    end_timestamp: number
    get_year: () => number
    speed: GameSpeed
    set_speed: (new_speed: GameSpeed) => void
}
