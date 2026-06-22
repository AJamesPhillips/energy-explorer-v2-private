import { NuclearPlant } from "./interface"

// interface NuclearPlant
// {
//     name: string
//     lat: number
//     lon: number
//     nameplate_capacity_mw: number
//     construction_start: number
//     operational_year: number
//     decommissioned_year?: number
//     cost?: string
// }

export const nuclear_plants: NuclearPlant[] = [
    {
        type: "nuclear",
        name: "Torness",
        lat: 55.9680,
        lon: 2.4091,
        nameplate_capacity_MW: 1290,
        // construction_start: 1980,
        operational_year: 1989,
        decommissioned_year: 2030,
    },
    {
        type: "nuclear",
        name: "Hinkley Point C",
        lat: 51.2059,
        lon: -3.1429,
        nameplate_capacity_MW: 3260,
        // construction_start: 2017,
        operational_year: 2030,
        // cost: "£48 bn(2026)",
    },
    {
        type: "nuclear",
        name: "Hartlepool",
        lat: 54.635,
        lon: -1.1808,
        nameplate_capacity_MW: 1185,
        // construction_start: 1969,
        operational_year: 1983,
        decommissioned_year: 2028,
    },
    {
        type: "nuclear",
        name: "Heysham 1",
        lat: 54.0289,
        lon: -2.9161,
        nameplate_capacity_MW: 1060,
        // construction_start: 1970,
        operational_year: 1983,
        decommissioned_year: 2028,
    },
    {
        type: "nuclear",
        name: "Heysham 2",
        lat: 54.0289,
        lon: -2.9161,
        nameplate_capacity_MW: 1240,
        // construction_start: 1980,
        operational_year: 1988,
        decommissioned_year: 2030,
    },
    {
        type: "nuclear",
        name: "Sizewell B",
        lat: 52.2150,
        lon: 1.6197,
        nameplate_capacity_MW: 1198,
        // construction_start: 1988,
        operational_year: 1995,
        decommissioned_year: 2035, // or 2055
    },
    {
        type: "nuclear",
        name: "Sizewell C",
        lat: 52.2193,
        lon: 1.6203,
        nameplate_capacity_MW: 3260,
        // construction_start: 2023,
        operational_year: undefined, // not yet commissioned
    },
]
