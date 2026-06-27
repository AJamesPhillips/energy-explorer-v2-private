import {
    cellArea,
    cellToBoundary,
    cellToChildren,
    getRes0Cells,
    isPentagon,
} from "h3-js"
import * as THREE from "three"

import { convert_lat_lon_to_array_sphere } from "../utils/geo/convert_lat_lon_to_sphere"
import { H3GridConfig } from "./interface"
import { log_dgg_stats } from "./stats"

// Expose H3 globally for debugging
import * as H3 from "h3-js"
(window as any).H3 = H3


export function draw_h3_grid(earth_mesh: THREE.Mesh, config: H3GridConfig)
{
    const resolution = config.h3_resolution
    const radius = config.radius

    // Get all cells at the specified resolution
    const res_0_cells = getRes0Cells()

    let all_cells: string[] = []

    if (resolution === 0) all_cells = res_0_cells//.slice(0,15)
    else
    {
        // Get children at the specified resolution
        for (const res0Cell of res_0_cells)
        {
            const children = cellToChildren(res0Cell, resolution)
            all_cells.push(...children)
        }
    }

    // Calculate areas for comparison
    const hexagon_areas: number[] = []
    const pentagon_areas: number[] = []

    const vertices: number[] = []
    const all_indices: number[] = []

    const vertex_map: Record<string, number> = {}

    let next_vertex_index = 0
    function add_vertex(x: number, y: number, z: number): number
    {
        // Maybe we need to round x, y and z to avoid floating point precision issues
        const key = `${x},${y},${z}`
        if (vertex_map[key] !== undefined) return vertex_map[key]

        vertices.push(x, y, z)
        vertex_map[key] = next_vertex_index
        return next_vertex_index++
    }


    for (const cell of all_cells)
    {
        const boundary = cellToBoundary(cell, false) // false for [lat,lng] not GeoJSON format [lng, lat]
        const area = cellArea(cell, "km2")
        const is_pentagon = isPentagon(cell)
        ;(is_pentagon ? pentagon_areas : hexagon_areas).push(area)

        // Convert H3 boundary to 3D coordinates on sphere
        // And triangulate the polygon using simple fan triangulation
        const indices: number[] = []

        for (let i = 0; i < boundary.length; ++i)
        {
            const [lat, lng] = boundary[i]!
            const index = add_vertex(...convert_lat_lon_to_array_sphere(lat, lng, radius))
            indices.push(index)
        }

        // Triangulate the polygon (simple fan triangulation)
        for (let i = 1; i < indices.length - 1; ++i)
        {
            all_indices.push(indices[0]!, indices[i]!, indices[i + 1]!)
        }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(all_indices)
    geometry.computeVertexNormals()

    const name = `H3 grid (resolution: ${resolution}, total cells: ${all_cells.length})`
    log_dgg_stats(name, pentagon_areas, hexagon_areas, false)

    const material = new THREE.MeshBasicMaterial({
        color: config.color || 0x00ff00,
        side: THREE.DoubleSide,
        wireframe: config.wireframe,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 0)
    earth_mesh.add(mesh)
}
