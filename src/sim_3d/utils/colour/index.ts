import * as THREE from "three"
import { Color, MeshBasicMaterial } from "three"


const DEFAULT_OPACITY = 0.6
const WIND_BLUE: [Color, number][] = [
    [new Color(0.85, 0.92, 1.00), DEFAULT_OPACITY],
    [new Color(0.72, 0.82, 1.00), DEFAULT_OPACITY],
    [new Color(0.60, 0.70, 1.00), DEFAULT_OPACITY],
    [new Color(0.49, 0.59, 1.00), DEFAULT_OPACITY],
    [new Color(0.38, 0.48, 1.00), DEFAULT_OPACITY],
    [new Color(0.27, 0.37, 1.00), DEFAULT_OPACITY],
    [new Color(0.18, 0.26, 0.96), DEFAULT_OPACITY],
    [new Color(0.06, 0.14, 0.88), DEFAULT_OPACITY],
]

const WIND_BLUE_NUMBER_OF_BUCKETS = WIND_BLUE.length - 1 // -1 makes math easier
export function wind_blue(capacity_factor: number): [Color, number]
{
    const bucket_index = Math.round(capacity_factor * WIND_BLUE_NUMBER_OF_BUCKETS)
    return WIND_BLUE[bucket_index]!
}


const SOLAR_YELLOW: [Color, number][] = Array(8).fill(0).map((_, i) =>
{
    const capacity_factor = i / 7
    // const capacity_factor2 = 0.2 + capacity_factor * 0.8
    const r = 1 //capacity_factor2
    const g = 1 // capacity_factor2
    const b = 0.3 + capacity_factor * 0.7
    // const opacity = 0.4 + Math.min(capacity_factor * 0.7, 0.3)
    const opacity = i === 0 ? 0 : DEFAULT_OPACITY
    return [new Color(r, g, b).convertSRGBToLinear(), opacity]
})

const SOLAR_YELLOW_NUMBER_OF_BUCKETS = SOLAR_YELLOW.length - 1 // -1 makes math easier
export function solar_yellow(capacity_factor: number)
{
    const bucket_index = Math.round(capacity_factor * SOLAR_YELLOW_NUMBER_OF_BUCKETS)
    return SOLAR_YELLOW[bucket_index]!
}


export const WIND_BLUE_MATERIAL: MeshBasicMaterial[] = WIND_BLUE.map(([color, opacity]) => {
    return new MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.BackSide,
    })
})
export function wind_blue_material(capacity_factor: number, is_continuous = false): MeshBasicMaterial
{
    if (is_continuous) return get_interpolated_material(capacity_factor, WIND_BLUE)

    const bucket_index = Math.round(capacity_factor * WIND_BLUE_NUMBER_OF_BUCKETS)
    return WIND_BLUE_MATERIAL[bucket_index]!
}

export const SOLAR_YELLOW_MATERIAL: MeshBasicMaterial[] = SOLAR_YELLOW.map(([color, opacity]) => {
    return new MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.BackSide,
    })
})
export function solar_yellow_material(capacity_factor: number, is_continuous = false): MeshBasicMaterial
{
    if (is_continuous) return get_interpolated_material(capacity_factor, SOLAR_YELLOW)

    const bucket_index = Math.round(capacity_factor * SOLAR_YELLOW_NUMBER_OF_BUCKETS)
    return SOLAR_YELLOW_MATERIAL[bucket_index]!
}


function get_interpolated_material(capacity_factor: number, colours: [Color, number][]): MeshBasicMaterial
{
    const number_of_buckets = colours.length - 1
    const lower_bucket_index = Math.floor(capacity_factor * number_of_buckets)
    const upper_bucket_index = Math.ceil(capacity_factor * number_of_buckets)
    const lower_colour = colours[lower_bucket_index]!
    const upper_colour = colours[upper_bucket_index]!

    // Interpolate between the two materials based on the capacity factor
    const t = (capacity_factor * number_of_buckets) - lower_bucket_index
    const [colour, opacity] = interpolate_color(lower_colour, upper_colour, t)
    return new MeshBasicMaterial({
        color: colour,
        transparent: true,
        opacity,
        side: THREE.BackSide,
    })
}

function interpolate_color(colour1: [Color, number], colour2: [Color, number], t: number): [Color, number]
{
    const interpolated_color = colour1[0].clone().lerp(colour2[0], t)
    const interpolated_opacity = colour1[1] + (colour2[1] - colour1[1]) * t
    return [interpolated_color, interpolated_opacity]
}
