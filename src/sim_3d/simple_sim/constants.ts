import * as THREE from "three"


const Z_MAP_OFFSET = 0.0
const Z_EEZ_OUTLINE_OFFSET = 0.1
const Z_DGG5_OFFSET = 0.2
const Z_DGG4_OFFSET = 0.3
const Z_DGG_CELL_HIGHLIGHT_OFFSET = 0.4

const Z_THICKNESS = 0.1

export const CONSTANTS = {
    GRID_SIZE: { x: 30, y: 42 },
    CELL_SIZE: 20,

    BUILDINGS_PER_SUBURBAN_TILE: 3,
    BUILDINGS_PER_URBAN_TILE: 3,
    TREES_PER_TILE: 3,

    Z_MAP_OFFSET,
    Z_MAP_THICKNESS: Z_THICKNESS,
    Z_EEZ_OUTLINE_OFFSET,
    Z_EEZ_OUTLINE_THICKNESS: Z_THICKNESS,
    Z_DGG4_OFFSET,
    Z_DGG5_OFFSET,
    Z_DGG_THICKNESS: Z_THICKNESS,
    Z_DGG_CELL_HIGHLIGHT_OFFSET,
    Z_DGG_CELL_HIGHLIGHT_THICKNESS: Z_THICKNESS,

    RENDER_ORDER:
    {
        H3_LAND_CELLS: 0,
        H3_CELLS: 1,
    }
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


export const COLOURS = {
    // country_outline: "#40beea",
    country_outline: "#404040",
    country_fill: "#999999",
    dgg_grid: "#60b0b0",
    dgg_highlight: "#f0c000",
    coal: "#333",
    oil: "#e07020",
    gas: "#2a7ae4",
}
