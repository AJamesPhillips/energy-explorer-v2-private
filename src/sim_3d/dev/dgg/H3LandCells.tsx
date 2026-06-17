import * as h3 from "h3-js"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { LandH3Cell } from "../../data/coverage_land/uk/data"
import { CONSTANTS } from "../../simple_sim/constants"
import { tile_colour } from "../../simple_sim/tile"
import { build_geom, get_projection, latlon_tuples_to_objs } from "../projection"


const { Z_DGG_THICKNESS, Z_DGG5_OFFSET, RENDER_ORDER } = CONSTANTS



export function H3LandCells(props: {
    h3_cells: LandH3Cell[],
    extrude_depth?: number,
    y_offset?: number,
})
{
    const { h3_cells, y_offset=Z_DGG5_OFFSET } = props
    let { extrude_depth=Z_DGG_THICKNESS } = props
    extrude_depth *= 0.9

    const fill_mesh_refs = useRef<(THREE.Mesh | null)[]>([])

    const coords = useMemo(() => {
        const projection = get_projection()

        // Build three.js geometries: extruded fills and outlines, then merge
        const fill: { geometry: THREE.BufferGeometry, colour: string }[] = []
        const outline_geoms: THREE.BufferGeometry[] = []

        h3_cells.forEach(h3_cell => {
            const latlon_tuple_boundary = h3.cellToBoundary(h3_cell.id)
            // h3 gives lat,lon tuple
            const latlon_boundary = latlon_tuples_to_objs(latlon_tuple_boundary)

            const cell_geometries = build_geom(projection, latlon_boundary, extrude_depth)
            if (!cell_geometries) return
            fill.push({ geometry: cell_geometries.fill, colour: tile_colour(h3_cell.type) })
            outline_geoms.push(cell_geometries.outline)

            cell_geometries.fill.name = h3_cell.id
        })

        // const merged_fill = fill.length ? mergeGeometries(fill, true) : null
        const merged_outline = outline_geoms.length ? mergeGeometries(outline_geoms, false) : null

        return { fill, merged_outline }
    }, [h3_cells])


    return <>
        <group
            position={[0, y_offset, 0]}
            // renderOrder required otherwise h3r4 grid of wind/solar is
            // partially rendered behind the h3r5 land cells.
            renderOrder={RENDER_ORDER.H3_LAND_CELLS}
        >
            {coords.fill.map(({ geometry, colour }, i) =>
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
    </>
}
