import * as THREE from "three"
import type { FuelType } from "../3d_models/OilBarrel"
import type { LandOrSeaType } from "../data/coverage_land/uk/data"


const Z_MAP_OFFSET = 0.0
const Z_EEZ_OUTLINE_OFFSET = 0.1
const Z_DGG5_OFFSET = 0.2
const Z_DGG4_OFFSET = 0.3
const Z_DGG_CELL_HIGHLIGHT_OFFSET = Z_DGG4_OFFSET

const Z_THICKNESS = 0.1

export const CONSTANTS = {
    GRID_SIZE: { x: 30, y: 42 },
    CELL_SIZE: 20,

    BUILDINGS_PER_SUBURBAN_TILE: 3,
    BUILDINGS_PER_URBAN_TILE: 3,
    TREES_PER_TILE: 3,
    DEFAULT_SIZE_FOR_TILE_CONTENT: 5,

    Z_MAP_OFFSET,
    Z_MAP_THICKNESS: Z_THICKNESS,
    Z_EEZ_OUTLINE_OFFSET,
    Z_EEZ_OUTLINE_THICKNESS: Z_THICKNESS,
    Z_DGG4_OFFSET,
    Z_DGG5_OFFSET,
    Z_DGG_THICKNESS: Z_THICKNESS,
    Z_DGG_CELL_HIGHLIGHT_OFFSET,
    Z_DGG_CELL_HIGHLIGHT_THICKNESS: Z_THICKNESS * 3,

    RENDER_ORDER:
    {
        H3_LAND_CELLS: 0,
        H3_LAND_ITEMS: 1,
        H3_CELLS: 2,
    },

    ANIMATION:
    {
        LIGHTNING_BOLT:
        {
            DURATION_SIM_HOURS: 0.05,
            DURATION_FADE_SIM_HOURS: 0.00,
            RISE_HEIGHT_FACTOR: 1.5,
            // The amount of GW hours to represent each lighting bolt.
            GW_HOUR_CHUNKS: 0.2,
            // Maximum time between lightning bolts, in simulation time
            MAX_INTERVAL_SIM_HOURS: 1,
            // The smallest a lighting bolt can be scaled down to
            MIN_LIGHTNING_BOLT_SCALE: 0.1,
        }
    },
}

export const DEFAULTS = {
    sun_args: {
        colour: new THREE.Color(255, 248, 200),
        ambient_intensity: 0.005,
        direct_intensity: 0.0075,
        direct_position: [ 15, 5, 7 ] as [number, number, number],
    }
}


const WIDTH = () => Math.min(window.innerWidth - 60, 500)
const HEIGHT = 160
const PADDING = { top: 10, right: 10, bottom: 22, left: 48 }
const PLOT_W = () => WIDTH() - PADDING.left - PADDING.right
const PLOT_H = HEIGHT - PADDING.top - PADDING.bottom

export const GRAPH_CONSTANTS = {
    WIDTH,
    HEIGHT,
    PADDING,
    PLOT_W,
    PLOT_H,
}



const FUEL_COLORS: Record<FuelType, string> = {
    crude:        "#1a1a1a",
    diesel:       "#4f371f",
    heating_fuel: "#85573e",
    jet_fuel:     "#c8b45a",
    petrol:       "#e8dfa0",
    natural_gas:  "#2266ee",
}

const subtype_to_colour: Record<LandOrSeaType, string> = {
    woodland:     "#228B22",
    arable:       "#DEB887",
    grassland:    "#7CFC00",
    wetland:      "#698b2e",
    rock:         "#A9A9A9",
    inland_water: "#399cff",
    urban:        "#696969",
    suburban:     "#D3D3D3",
    non_territory_land: "#d2ffd1",

    shallow:      "#0d84fa",
    deep:         "#0a5096",
    non_territory_sea: "#dae6ff",
}

export const COLOURS = {
    // country_outline: "#40beea",
    country_outline: "#404040",
    country_fill: "#999999",
    country_territorial_waters: subtype_to_colour.deep,
    dgg_grid: "#60b0b0",
    dgg_highlight: "#f0c000",

    tree: "#1a4a1a",
    suburban: "#ab5154",
    urban: "#8899aa",

    supply_electricity: "#44bbff",
    supply_electricity_emissive: "#0055ff",
    demand_electricity: "#ff4444",
    demand_electricity_emissive: "#550000",

    coal: "#333",
    oil: "#e07020",
    gas: "#2a7ae4",

    FUEL_COLORS,
    METAL_COLOR: "#7a7a7a",
    pylon: "#444444",
    pylon_arm: "#6666ff",
    pipeline: {
        electric: "#ebcc00",
        gas: "#2a7ae4",
        oil: "#e07020",
    },
}

export function tile_colour(subtype: LandOrSeaType | undefined): string
{
    const colour = subtype ? subtype_to_colour[subtype] : ""
    return colour || "#FFFFFF"
}
