import * as h3 from "h3-js"
import { useMemo } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { CONSTANTS } from "../../simple_sim/constants"
import { build_geom, get_projection, latlon_tuples_to_objs } from "../projection"


const { Z_DGG_THICKNESS: Z_DGG } = CONSTANTS


export function H3Cells(props: {
    h3_cell_ids: string[],
    extrude_depth?: number,
    y_offset?: number,
})
{
    const { h3_cell_ids, y_offset=0 } = props
    let { extrude_depth=Z_DGG } = props
    extrude_depth *= 0.9

    const coords = useMemo(() => {
        const projection = get_projection()

        // Build three.js geometries: extruded fills and outlines, then merge
        const fill_geoms: THREE.BufferGeometry[] = []
        const line_geoms: THREE.BufferGeometry[] = []

        h3_cell_ids.forEach(cell => {
            const latlon_tuple_boundary = h3.cellToBoundary(cell)
            // h3 gives lat,lon tuple
            const latlon_boundary = latlon_tuples_to_objs(latlon_tuple_boundary)

            const cell_geometries = build_geom(projection, latlon_boundary, extrude_depth)
            if (!cell_geometries) return
            fill_geoms.push(cell_geometries.fill)
            line_geoms.push(cell_geometries.outline)
        })

        const merged_fill = fill_geoms.length ? mergeGeometries(fill_geoms, true) : null
        const merged_outline = line_geoms.length ? mergeGeometries(line_geoms, false) : null

        return { merged_fill, merged_outline }
    }, [h3_cell_ids])

    return <>
        <group position={[0, y_offset, 0]}>
            {coords.merged_fill && (
                <mesh geometry={coords.merged_fill}>
                    <meshStandardMaterial color="skyblue" transparent opacity={0.18} side={THREE.DoubleSide} />
                </mesh>
            )}
            {coords.merged_outline && (
                <lineSegments geometry={coords.merged_outline}>
                    <lineBasicMaterial color={0x40ae00} linewidth={2} />
                </lineSegments>
            )}
        </group>
    </>
}
