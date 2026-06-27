import { cellToBoundary } from "h3-js"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { get_app_state } from "../../../state/store"
import { SuburbanTiles } from "../../3d_models/Suburban"
import { UrbanTiles } from "../../3d_models/Urban"
import { Woodland } from "../../3d_models/Woodland"
import { LandH3Cell, SIMPLIFIED_LAND_AREA_TYPES, SimplifiedLandAreaType } from "../../data/coverage_land/uk/data"
import { CONSTANTS, tile_colour } from "../../simple_sim/constants"
import { build_geom, get_projection, latlon_tuples_to_objs } from "../projection"


const {
    Z_DGG_THICKNESS,
    Z_DGG5_OFFSET,
    RENDER_ORDER,
} = CONSTANTS


export function H3LandCells(props: {
    h3_cells: LandH3Cell[],
    extrude_depth?: number,
    y_offset?: number,
})
{
    const { h3_cells, y_offset=Z_DGG5_OFFSET } = props
    let { extrude_depth=Z_DGG_THICKNESS } = props
    extrude_depth *= 0.9

    const showing_a_capacity_factor = get_app_state(state => state.view.map_capacity_factors_source !== false)
    const opacity = showing_a_capacity_factor ? 0.5 : 1

    const fill_mesh_refs = useRef<(THREE.Mesh | null)[]>([])

    const { fill, tiles_by_type } = calculate_cell_fills_and_models_to_render(h3_cells, extrude_depth)

    return <>
        <group
            position={[0, y_offset, 0]}
            // renderOrder required otherwise h3r4 grid of wind/solar is
            // partially rendered behind the h3r5 land cells.
            renderOrder={RENDER_ORDER.H3_LAND_CELLS}
        >
            {fill.map(({ geometry, colour }, i) =>
                <mesh
                    geometry={geometry}
                    key={geometry.uuid}
                    ref={el => { fill_mesh_refs.current[i] = el }}
                >
                    <meshStandardMaterial color={colour} transparent opacity={0.78} side={THREE.DoubleSide} />
                </mesh>
            )}
            {/* {coords.merged_outline && (
                <lineSegments geometry={coords.merged_outline}>
                    <lineBasicMaterial color={COLOURS.dgg_grid} linewidth={2} />
                </lineSegments>
            )} */}
        </group>

        <group position={[0, y_offset, 0]}>
            <Woodland tiles={tiles_by_type.woodland} opacity={opacity} />
            <UrbanTiles tiles={tiles_by_type.urban} opacity={opacity} />
            <SuburbanTiles tiles={tiles_by_type.suburban} opacity={opacity} />
        </group>
    </>
}


function calculate_cell_fills_and_models_to_render(h3_cells: LandH3Cell[], extrude_depth: number)
{
    return useMemo(() => {
        const projection = get_projection()

        // Build three.js geometries: group fills by terrain type, merge per-type
        const fills_by_type: Record<SimplifiedLandAreaType, { geometries: THREE.BufferGeometry[]; colour: string }> = SIMPLIFIED_LAND_AREA_TYPES.reduce((acc, type) => {
            acc[type] = { geometries: [], colour: tile_colour(type) }
            return acc
        }, {} as Record<SimplifiedLandAreaType, { geometries: THREE.BufferGeometry[]; colour: string }>)

        // Collect tile centers and size estimates per-type so we can render
        // Suburban/Urban/Woodland instanced meshes positioned in the same
        // projection coordinate space as the fills.
        const tiles_by_type: Record<SimplifiedLandAreaType, { x: number; y: number; h3h5_id: string }[]> = SIMPLIFIED_LAND_AREA_TYPES.reduce((acc, type) => {
            acc[type] = []
            return acc
        }, {} as Record<SimplifiedLandAreaType, { x: number; y: number; h3h5_id: string }[]>)

        h3_cells.forEach(h3_cell => {
            const latlon_tuple_boundary = cellToBoundary(h3_cell.h3h5_id)
            // h3 gives lat,lon tuple
            const latlon_boundary = latlon_tuples_to_objs(latlon_tuple_boundary)

            const cell_geometries = build_geom(projection, latlon_boundary, extrude_depth)
            if (!cell_geometries) return

            fills_by_type[h3_cell.type].geometries.push(cell_geometries.fill)

            // Compute projected center for this H3 cell so the instanced tile
            // models can be positioned correctly.
            const pts = latlon_boundary.map(p => projection(p)).filter(Boolean) as { x: number; y: number }[]
            if (pts.length > 0) {
                const xs = pts.map(p => p.x)
                const ys = pts.map(p => p.y)
                const centerX = xs.reduce((a, b) => a + b, 0) / xs.length
                const centerY = ys.reduce((a, b) => a + b, 0) / ys.length
                tiles_by_type[h3_cell.type].push({ x: centerX, y: centerY, h3h5_id: h3_cell.h3h5_id })
            }
        })

        const fill: { geometry: THREE.BufferGeometry; colour: string }[] = []
        SIMPLIFIED_LAND_AREA_TYPES.forEach(type => {
            const geoms = fills_by_type[type].geometries
            if (!geoms.length) return
            const merged = geoms.length > 1 ? mergeGeometries(geoms, false) : geoms[0]
            if (merged) fill.push({ geometry: merged, colour: fills_by_type[type].colour })
        })

        return { fill, tiles_by_type }
    }, [h3_cells, h3_cells.length, extrude_depth])
}
