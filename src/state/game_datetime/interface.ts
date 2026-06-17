
export type GameSpeed = "paused" | "normal" | "fast"

export interface GameDatetimeState
{
    speed: GameSpeed
    set_speed: (new_speed: GameSpeed) => void
}
