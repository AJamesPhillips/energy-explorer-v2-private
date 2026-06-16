import * as THREE from "three"


const Z_MAP_OFFSET = 0
const Z_MAP_THICKNESS = 0.1
const Z_EEZ_OFFSET = Z_MAP_OFFSET + Z_MAP_THICKNESS
const Z_EEZ_THICKNESS = 0.1
const Z_DGG_OFFSET = Z_EEZ_OFFSET + Z_EEZ_THICKNESS
const Z_DGG_THICKNESS = 0.1

export const CONSTANTS = {
    GRID_SIZE: { x: 30, y: 42 },
    CELL_SIZE: 12,

    BUILDINGS_PER_SUBURBAN_TILE: 3,
    BUILDINGS_PER_URBAN_TILE: 3,
    TREES_PER_TILE: 3,

    Z_MAP_OFFSET,
    Z_MAP_THICKNESS,
    Z_EEZ_OFFSET,
    Z_EEZ_THICKNESS,
    Z_DGG_OFFSET,
    Z_DGG_THICKNESS,
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
    dgg_grid: "#60b0b0",
    coal: "#333",
    oil: "#e07020",
    gas: "#2a7ae4",
}
