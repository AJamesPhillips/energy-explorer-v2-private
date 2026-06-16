import * as THREE from "three"
import { Color, Material, MeshBasicMaterial } from "three"


const WIND_BLUE: [Color, number][] = [
    [new Color(0.85, 0.92, 1.00), 0.60],
    [new Color(0.72, 0.82, 1.00), 0.72],
    [new Color(0.60, 0.70, 1.00), 0.82],
    [new Color(0.49, 0.59, 1.00), 0.90],
    [new Color(0.38, 0.48, 1.00), 0.95],
    [new Color(0.27, 0.37, 1.00), 1.00],
    [new Color(0.18, 0.26, 0.96), 1.00],
    [new Color(0.06, 0.14, 0.88), 1.00],
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
    const capacity_factor2 = 0.2 + capacity_factor * 0.8
    const b_ = capacity_factor * 0.1
    const { r, g, b, opacity } = { r: capacity_factor2, g: capacity_factor2, b: b_, opacity: capacity_factor }
    return [new Color(r, g, b).convertSRGBToLinear(), opacity]
})

const SOLAR_YELLOW_NUMBER_OF_BUCKETS = SOLAR_YELLOW.length - 1 // -1 makes math easier
export function solar_yellow(capacity_factor: number)
{
    const bucket_index = Math.round(capacity_factor * SOLAR_YELLOW_NUMBER_OF_BUCKETS)
    return SOLAR_YELLOW[bucket_index]!
}


const WIND_BLUE_MATERIAL: Material[] = WIND_BLUE.map(([color, opacity]) => {
    return new MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.BackSide,
    })
})
export function wind_blue_material(capacity_factor: number): Material
{
    const bucket_index = Math.round(capacity_factor * WIND_BLUE_NUMBER_OF_BUCKETS)
    return WIND_BLUE_MATERIAL[bucket_index]!
}

const SOLAR_YELLOW_MATERIAL: Material[] = SOLAR_YELLOW.map(([color, opacity]) => {
    return new MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.BackSide,
    })
})
export function solar_yellow_material(capacity_factor: number): Material
{
    const bucket_index = Math.round(capacity_factor * SOLAR_YELLOW_NUMBER_OF_BUCKETS)
    return SOLAR_YELLOW_MATERIAL[bucket_index]!
}
