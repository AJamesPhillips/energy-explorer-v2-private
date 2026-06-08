import * as h3 from "h3-js"
import { useMemo } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { ILatLon } from "core/data/values/LatLon"

import { build_geom, get_projection, latlon_obj_to_latlon_tuple, latlon_tuple_to_obj } from "../projection"


export function H3Grid(props: {
    EEZ_coords_lonlat: ILatLon[],
    set_cell_count: (n: number) => void,
    resolution: number,
    // set_is_computing: (b: boolean) => void,
})
{
    const {
        EEZ_coords_lonlat,
        resolution,
    } = props

    const coords = useMemo(() => {
        // set_is_computing(true)
        const EEZ_coords_latlon = latlon_obj_to_latlon_tuple(EEZ_coords_lonlat)
        const cells = h3.polygonToCells(EEZ_coords_latlon, resolution)
        props.set_cell_count(cells.length)

        const projection = get_projection()

        // const pathGen = geoPath(projection, ctx)

        // Build three.js geometries: extruded fills and outlines, then merge
        const fill_geoms: THREE.BufferGeometry[] = []
        const line_geoms: THREE.BufferGeometry[] = []

        const extrude_depth = 0.1 // thin thickness in scene units

        cells.forEach(cell => {
            const latlon_tuple_boundary = h3.cellToBoundary(cell)
            // h3 gives lat,lon tuple
            const latlon_boundary = latlon_tuple_to_obj(latlon_tuple_boundary)

            const cell_geometries = build_geom(projection, latlon_boundary, extrude_depth)
            if (!cell_geometries) return
            fill_geoms.push(cell_geometries.fill)
            line_geoms.push(cell_geometries.outline)
        })

        const merged_fill = fill_geoms.length ? mergeGeometries(fill_geoms, true) : null
        const merged_outline = line_geoms.length ? mergeGeometries(line_geoms, false) : null

        return { merged_fill, merged_outline }
    }, [EEZ_coords_lonlat, resolution])

    return <>
        <group position={[0, 1.01, 0]}>
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
