import * as h3 from "h3-js"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { useFrame } from "@react-three/fiber"
import { COLOURS, CONSTANTS } from "../../simple_sim/constants"
import { CapacityFactorData } from "../../utils/capacity_factor_data"
import { solar_yellow_material, wind_blue_material } from "../../utils/colour"
import { build_geom, get_projection, latlon_tuples_to_objs } from "../projection"


const { Z_DGG_THICKNESS, RENDER_ORDER } = CONSTANTS


export function H3Cells(props: {
    h3_cell_ids: string[],
    extrude_depth?: number,
    y_offset?: number,
    capacity_data?: {
        data: CapacityFactorData | null,
        type: "wind" | "solar",
        display_type?: "discrete" | "continuous",
    },
})
{
    const { h3_cell_ids, y_offset=0 } = props
    let { extrude_depth=Z_DGG_THICKNESS } = props
    extrude_depth *= 0.9

    const fill_mesh_refs = useRef<(THREE.Mesh | null)[]>([])

    const coords = useMemo(() => {
        const projection = get_projection()

        // Build three.js geometries: extruded fills and outlines, then merge
        const fill_geoms: THREE.BufferGeometry[] = []
        const outline_geoms: THREE.BufferGeometry[] = []

        h3_cell_ids.forEach(h3_cell_id => {
            const latlon_tuple_boundary = h3.cellToBoundary(h3_cell_id)
            // h3 gives lat,lon tuple
            const latlon_boundary = latlon_tuples_to_objs(latlon_tuple_boundary)

            const cell_geometries = build_geom(projection, latlon_boundary, extrude_depth)
            if (!cell_geometries) return
            fill_geoms.push(cell_geometries.fill)
            outline_geoms.push(cell_geometries.outline)

            cell_geometries.fill.name = h3_cell_id
        })

        // const merged_fill = fill_geoms.length ? mergeGeometries(fill_geoms, true) : null
        const merged_outline = outline_geoms.length ? mergeGeometries(outline_geoms, false) : null

        return { fill_geoms, merged_outline }
    }, [h3_cell_ids])


    const animation_state_ref = useRef({
        datetime_index: 0,
        last_animated_at_seconds: -Infinity,
        animate_fps: 10,
    })


    useFrame(({ clock }) =>
    {
        if (!props.capacity_data || !props.capacity_data.data) return

        const elapsed_seconds = clock.getElapsedTime()
        const state = animation_state_ref.current
        if (!state.animate_fps) return
        if ((elapsed_seconds - state.last_animated_at_seconds) < (1 / state.animate_fps)) return
        state.last_animated_at_seconds = elapsed_seconds

        const { data: capacity_data, type, display_type } = props.capacity_data
        state.datetime_index = (state.datetime_index + 1) % capacity_data.date_time_to_index.size

        fill_mesh_refs.current.forEach(mesh =>
        {
            if (!mesh) return
            const h3_cell_id = mesh.geometry.name
            const capacity_factor = capacity_data.get_capacity_factor(state.datetime_index, h3_cell_id)
            const material_colour = type === "wind"
                ? wind_blue_material(capacity_factor, display_type === "continuous")
                : solar_yellow_material(capacity_factor, display_type === "continuous")
            mesh.material = material_colour
            mesh.material.needsUpdate = true
        })
    })


    return <>
        <group
            position={[0, y_offset, 0]}
            // renderOrder required otherwise h3r4 grid of wind/solar is
            // partially rendered behind the h3r5 land cells.
            renderOrder={RENDER_ORDER.H3_CELLS}
        >
            {coords.fill_geoms.map((fill_geom, i) =>
                <mesh
                    geometry={fill_geom}
                    key={fill_geom.uuid}
                    ref={el => { fill_mesh_refs.current[i] = el }}
                >
                    <meshStandardMaterial color="skyblue" transparent opacity={0.18} side={THREE.DoubleSide} />
                </mesh>
            )}
            {coords.merged_outline && (
                <lineSegments geometry={coords.merged_outline}>
                    <lineBasicMaterial color={COLOURS.dgg_grid} linewidth={2} />
                </lineSegments>
            )}
        </group>
    </>
}
