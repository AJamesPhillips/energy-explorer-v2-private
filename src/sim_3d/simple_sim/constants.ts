import * as THREE from "three"


export const CONSTANTS = {
    GRID_SIZE: { x: 20, y: 20 },
    CELL_SIZE: 12,

    BUILDINGS_PER_SUBURBAN_TILE: 3,
    BUILDINGS_PER_URBAN_TILE: 3,
    TREES_PER_TILE: 3,
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
    coal: "#333",
    oil: "#e07020",
    gas: "#2a7ae4",
}
