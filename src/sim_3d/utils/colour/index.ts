import * as THREE from "three"
import { Color, Material, MeshBasicMaterial } from "three"



// internal static Color bakers_blue8(float capacity_factor, float min = 0.25f, float max = 0.65f)
// {
//     var scaled_capacity_factor = (capacity_factor - min) / (max - min);

//     var number_of_buckets = 6f;
//     var capacity_factor_bucketed = (float)Math.Round(scaled_capacity_factor * number_of_buckets) / number_of_buckets;
//     var capacity_factor_bucketed_h2 = Mathf.Clamp((capacity_factor_bucketed * 1.3f) - 0.3f, 0, 1);

//     var r = 0.15f + capacity_factor_bucketed * 0.68f;
//     var g = 0.25f + capacity_factor_bucketed * 0.68f;
//     var b = 1f;
//     return new Color(r, g, b, capacity_factor_bucketed_h2);
// }
const BAKERS_BLUE: [Color, number][] = [
    [new Color(0.263, 0.363, 1).convertSRGBToLinear(), 0],
    [new Color(0.150, 0.250, 1).convertSRGBToLinear(), 0.15],
    [new Color(0.377, 0.477, 1).convertSRGBToLinear(), 0.3],
    [new Color(0.490, 0.590, 1).convertSRGBToLinear(), 0.45],
    [new Color(0.603, 0.703, 1).convertSRGBToLinear(), 0.6],
    [new Color(0.717, 0.817, 1).convertSRGBToLinear(), 0.75],
    [new Color(0.830, 0.930, 1).convertSRGBToLinear(), 0.9],
    [new Color(1, 1, 1).convertSRGBToLinear(), 1],
]

const BAKERS_BLUE_NUMBER_OF_BUCKETS = BAKERS_BLUE.length - 1 // -1 makes math easier
export function bakers_blue(capacity_factor: number): [Color, number]
{
    const bucket_index = Math.round(capacity_factor * BAKERS_BLUE_NUMBER_OF_BUCKETS)
    return BAKERS_BLUE[bucket_index]!
}


// internal static Color solar(float capacity_factor, float min = 0.1f, float max = 0.4f)
// {
//     var scaled_capacity_factor = (capacity_factor - min) / (max - min);

//     var number_of_buckets = 6f;
//     var capacity_factor_bucketed = (float)Math.Round(scaled_capacity_factor * number_of_buckets) / number_of_buckets;
//     var capacity_factor_bucketed_h2 = Mathf.Clamp((capacity_factor_bucketed * 1.3f) - 0.3f, 0, 1);

//     var r = 0.75f + capacity_factor_bucketed * 0.25f;
//     var g = 0.75f + capacity_factor_bucketed * 0.25f;
//     var b = 0.15f + capacity_factor_bucketed * 0.68f;
//     return new Color(r, g, b, capacity_factor_bucketed_h2);
// }
const SOLAR_YELLOW: [Color, number][] = [
    [new Color(0.229, 0.293, 0.000).convertSRGBToLinear(), 0],
    [new Color(0.358, 0.410, 0.063).convertSRGBToLinear(), 0.15],
    [new Color(0.487, 0.527, 0.212).convertSRGBToLinear(), 0.3],
    [new Color(0.616, 0.644, 0.361).convertSRGBToLinear(), 0.5],
    [new Color(0.745, 0.761, 0.510).convertSRGBToLinear(), 0.75],
    [new Color(0.874, 0.878, 0.659).convertSRGBToLinear(), 1],
    [new Color(1, 1, 0.835).convertSRGBToLinear(), 1],
    [new Color(1, 1, 1).convertSRGBToLinear(), 1],
]

const SOLAR_YELLOW_NUMBER_OF_BUCKETS = SOLAR_YELLOW.length - 1 // -1 makes math easier
export function solar_yellow(capacity_factor: number)
{
    const bucket_index = Math.round(capacity_factor * SOLAR_YELLOW_NUMBER_OF_BUCKETS)
    return SOLAR_YELLOW[bucket_index]!
}



const BAKERS_BLUE_MATERIAL: Material[] = BAKERS_BLUE.map(([color, opacity]) => {
    return new MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.BackSide,
    })
})
export function bakers_blue_material(capacity_factor: number): Material
{
    const bucket_index = Math.round(capacity_factor * BAKERS_BLUE_NUMBER_OF_BUCKETS)
    return BAKERS_BLUE_MATERIAL[bucket_index]!
}

const SOLAR_YELLOW_MATERIAL: Material[] = SOLAR_YELLOW.map(([color, opacity]) => {
    return new MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.BackSide,
    })
})
const used_indexes = new Set<number>()
;(window as any).used_solar_yellow_indexes = used_indexes // For debugging purposes
export function solar_yellow_material(capacity_factor: number): Material
{
    const bucket_index = Math.round(capacity_factor * SOLAR_YELLOW_NUMBER_OF_BUCKETS)
    // used_indexes.add(bucket_index)
    if (capacity_factor > 890) used_indexes.add(capacity_factor)
    return SOLAR_YELLOW_MATERIAL[bucket_index]!
}
