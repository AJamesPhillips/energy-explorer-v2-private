
export function clamp(value: number, min: number = 0, max: number = 1): number
{
    return Math.max(min, Math.min(max, value))
}

export const ease_out_cubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const ease_out_quad = (t: number) => 1 - Math.pow(1 - t, 2)
export const ease_in_cubic = (t: number) => t * t * t
export const ease_in_quad = (t: number) => t * t
