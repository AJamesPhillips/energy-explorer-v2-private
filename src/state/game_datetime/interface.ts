
export type GameSpeed = "paused" | "normal" | "fast"

export interface GameDatetimeState
{
    datetime: Date
    speed: GameSpeed
    set_datetime: (new_datetime: Date) => void
    set_speed: (new_speed: GameSpeed) => void
}
