import { ThreeEvent } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { CONSTANTS } from "../../simple_sim/constants"
import pub_sub from "../../state/pub_sub"
import { CapacityFactorData } from "../../utils/capacity_factor_data"
import { SOLAR_YELLOW_MATERIAL, WIND_BLUE_MATERIAL } from "../../utils/colour"
import { cell_to_geometries } from "../projection"
import { H3CellBoundaryAndHighlight } from "./H3CellBoundaryAndHighlight"

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

    const merged_mesh_ref = useRef<THREE.Mesh | null>(null)

    // Build merged geometry and record per-cell vertex ranges
    const coords = useMemo(() => {
        if (h3_cell_ids.length === 0) return { merged_fill: null, merged_outline: null, cell_ids: [], cell_vertex_ranges: [] }

        const fill_geoms: THREE.BufferGeometry[] = []
        const outline_geoms: THREE.BufferGeometry[] = []
        const cell_ids: string[] = []
        const cell_fill_vertex_counts: number[] = []
        const cell_outline_vertex_counts: number[] = []

        h3_cell_ids.forEach(h3_cell_id => {
            const cell_geometries = cell_to_geometries(h3_cell_id, extrude_depth)
            if (!cell_geometries) return
            fill_geoms.push(cell_geometries.fill)
            outline_geoms.push(cell_geometries.outline)
            cell_ids.push(h3_cell_id)
            cell_fill_vertex_counts.push(cell_geometries.fill.attributes.position!.count)
            cell_outline_vertex_counts.push(cell_geometries.outline.attributes.position!.count)

            cell_geometries.fill.name = h3_cell_id
        })

        const merged_fill = mergeGeometries(fill_geoms, false)
        const merged_outline = mergeGeometries(outline_geoms, false)

        const cell_vertex_ranges: { start: number, count: number }[] = []
        let offset = 0
        for (const c of cell_fill_vertex_counts)
        {
            cell_vertex_ranges.push({ start: offset, count: c })
            offset += c
        }

        const cell_outline_vertex_ranges: { start: number, count: number }[] = []
        let outline_offset = 0
        for (const c of cell_outline_vertex_counts)
        {
            cell_outline_vertex_ranges.push({ start: outline_offset, count: c })
            outline_offset += c
        }

        // Attach an attribute that maps each vertex to its originating cell index.
        const vertex_count1 = merged_fill.attributes.position!.count
        const arr1 = new Float32Array(vertex_count1)
        for (let i = 0; i < cell_vertex_ranges.length; i++) {
            const r = cell_vertex_ranges[i]!
            for (let j = 0; j < r.count; j++) arr1[r.start + j] = i
        }
        merged_fill.setAttribute("cell_index", new THREE.BufferAttribute(arr1, 1))


        const vertex_count2 = merged_outline.attributes.position!.count
        const arr2 = new Float32Array(vertex_count2)
        for (let i = 0; i < cell_outline_vertex_ranges.length; i++) {
            const r = cell_outline_vertex_ranges[i]!
            for (let j = 0; j < r.count; j++) arr2[r.start + j] = i
        }
        merged_outline.setAttribute("cell_index", new THREE.BufferAttribute(arr2, 1))

        return { merged_fill, merged_outline, cell_ids, cell_vertex_ranges }
    }, [h3_cell_ids])


    // Build small palettes from the cached materials
    const palettes = useMemo(() => {
        const fromMaterials = (arr: THREE.Material[]) => arr.map((m: any) => {
            const mb = m as THREE.MeshBasicMaterial
            const c = mb.color
            const o = mb.opacity ?? 1
            return new THREE.Vector4(c.r, c.g, c.b, o)
        })
        return {
            wind: fromMaterials(WIND_BLUE_MATERIAL),
            solar: fromMaterials(SOLAR_YELLOW_MATERIAL),
        }
    }, [])

    // Shader material: reads an attribute `palette_index` and samples a small
    // `palette[8]` uniform. Values can be fractional for interpolation.
    const shader_material = useMemo(() => {
        const vertexShader = `
            attribute float palette_index;
            varying float v_palette_index;
            void main() {
                v_palette_index = palette_index;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
            }
        `

        const fragmentShader = `
            precision highp float;
            uniform vec4 palette[8];
            varying float v_palette_index;
            void main() {
                float idxf = clamp(v_palette_index, 0.0, 7.0);
                float lowerf = floor(idxf);
                int lower = int(lowerf);
                int upper = int(min(lowerf + 1.0, 7.0));
                float t = idxf - lowerf;
                vec4 c1 = palette[lower];
                vec4 c2 = palette[upper];
                vec4 color = mix(c1, c2, t);
                gl_FragColor = color;
            }
        `

        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: { palette: { value: palettes.wind } },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        })
    }, [palettes])

    // Allocate palette_index attribute once
    useMemo(() => {
        if (!coords.merged_fill) return
        const geom = coords.merged_fill
        const vertex_count = geom.attributes.position!.count
        if (!geom.getAttribute("palette_index")) {
            const arr = new Float32Array(vertex_count)
            geom.setAttribute("palette_index", new THREE.BufferAttribute(arr, 1))
        }
    }, [coords.merged_fill])

    const animation_state_ref = useRef({
        last_animated_at_ms: -Infinity,
        animate_fps: 10,
    })

    // Track current hover to avoid repeated publishes
    const { handle_pointer_move, handle_pointer_leave, handle_click } = make_pointer_move_and_click_handlers(coords)

    useEffect(() => {
        if (!props.capacity_data || !props.capacity_data.data || !coords.merged_fill) return

        const capacity_data = props.capacity_data.data

        // Build an index -> ms array for fast lookup (ordered by index)
        const datetime_ms_by_index: number[] = new Array(capacity_data.date_time_to_index.size)
        capacity_data.date_time_to_index.forEach((idx, date_time) => {
            datetime_ms_by_index[idx] = Date.parse(date_time)
        })

        const state = animation_state_ref.current

        const unsub = pub_sub.sub("simulation_datetime", (payload) => {
            const now = performance.now()
            if (!state.animate_fps) return
            if ((now - state.last_animated_at_ms) < (1000 / state.animate_fps)) return
            state.last_animated_at_ms = now

            // const datetime_index = find_closest_index(datetime_ms_by_index,  payload.datetime_ms)
            const datetime_index1 = payload.datetime_annual_hourly_index1 % capacity_data.date_time_to_index.size
            const datetime_index2 = payload.datetime_annual_hourly_index2 % capacity_data.date_time_to_index.size
            const datetime_index_mix = payload.datetime_annual_hourly_index_mix

            const mesh = merged_mesh_ref.current
            if (!mesh) return
            const geom = mesh.geometry as THREE.BufferGeometry
            if (!geom || !coords.cell_ids || !coords.cell_vertex_ranges) return

            // Use the shader material and update its palette uniform for the current type
            mesh.material = shader_material
            const palette = props.capacity_data!.type === "wind" ? palettes.wind : palettes.solar
            ;(shader_material.uniforms as any).palette.value = palette

            const attr = geom.getAttribute("palette_index") as THREE.BufferAttribute
            const arr = attr.array as Float32Array
            const palette_count = palette.length

            coords.cell_ids.forEach((cell_id, i) =>
            {
                const capacity_factor = get_capacity_factor_mix(capacity_data, datetime_index1, datetime_index2, datetime_index_mix, cell_id) ?? 0
                const idxf = props.capacity_data!.display_type === "continuous"
                    ? capacity_factor * (palette_count - 1)
                    : Math.round(capacity_factor * (palette_count - 1))

                const range = coords.cell_vertex_ranges[i]!
                const start = range.start
                const end = start + range.count
                for (let v = start; v < end; v++) arr[v] = idxf
            })

            attr.needsUpdate = true
        }, "H3Cells-sim")

        return unsub
    }, [props.capacity_data, coords.merged_fill, coords.cell_ids, coords.cell_vertex_ranges, palettes, shader_material])

    return <>
        <group
            position={[0, y_offset, 0]}
            renderOrder={RENDER_ORDER.H3_CELLS}
        >
            {coords.merged_fill && (
                <mesh
                    geometry={coords.merged_fill}
                    ref={el => { merged_mesh_ref.current = el }}
                    material={shader_material}
                    onPointerMove={handle_pointer_move}
                    onPointerOut={handle_pointer_leave}
                    onPointerLeave={handle_pointer_leave}
                    onClick={handle_click}
                />
            )}
            {coords.merged_outline && <H3CellBoundaryAndHighlight merged_outline={coords.merged_outline} />}
        </group>
    </>
}



function make_pointer_move_and_click_handlers(coords: { merged_fill: THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap> | null; merged_outline: THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap> | null; cell_ids: string[]; cell_vertex_ranges: { start: number; count: number }[] }) {
    const hover_ref = useRef<string | null>(null)

    const find_cell_index_for_vertex = useCallback((vertexIndex: number | undefined) => {
        if (vertexIndex === undefined) return -1
        const ranges = coords.cell_vertex_ranges
        if (!ranges) return -1
        for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i]!
            if (vertexIndex >= r.start && vertexIndex < (r.start + r.count)) return i
        }
        return -1
    }, [coords.cell_vertex_ranges])

    const handle_pointer_move = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        // Try to get a vertex index from the intersection info
        const face = (e as any).face
        const faceIndex = (e as any).faceIndex
        let vertexIndex: number | undefined
        if (face && typeof face.a === "number") vertexIndex = face.a
        else if (typeof faceIndex === "number") vertexIndex = faceIndex * 3
        else if ((e as any).index !== undefined) vertexIndex = (e as any).index

        const ci = find_cell_index_for_vertex(vertexIndex)
        if (ci === -1) {
            if (hover_ref.current !== null) {
                hover_ref.current = null
                pub_sub.pub("on_hover_tile", null)
            }
            return
        }

        const cell_id = coords.cell_ids[ci]!
        if (hover_ref.current !== cell_id) {
            hover_ref.current = cell_id
            pub_sub.pub("on_hover_tile", { h3_id: cell_id })
        }
    }, [coords.cell_ids, find_cell_index_for_vertex])

    const handle_pointer_leave = useCallback(() => {
        if (hover_ref.current !== null) {
            hover_ref.current = null
            pub_sub.pub("on_hover_tile", null)
        }
    }, [])

    const handle_click = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        const face = (e as any).face
        const faceIndex = (e as any).faceIndex
        let vertexIndex: number | undefined
        if (face && typeof face.a === "number") vertexIndex = face.a
        else if (typeof faceIndex === "number") vertexIndex = faceIndex * 3
        else if ((e as any).index !== undefined) vertexIndex = (e as any).index

        const ci = find_cell_index_for_vertex(vertexIndex)
        if (ci === -1) return
        const cell_id = coords.cell_ids[ci]!
        const cell = { h3_id: cell_id }
        pub_sub.pub("on_click_tile", cell)
    }, [coords.cell_ids, find_cell_index_for_vertex])
    return { handle_pointer_move, handle_pointer_leave, handle_click }
}

function get_capacity_factor_mix(capacity_data: CapacityFactorData, idx1: number, idx2: number, mix: number, cell_id: string): number | undefined
{
    const cf1 = capacity_data.get_capacity_factor(idx1, cell_id)
    const cf2 = capacity_data.get_capacity_factor(idx2, cell_id)
    if (cf1 === undefined && cf2 === undefined) return undefined
    if (cf1 === undefined) return cf2
    if (cf2 === undefined) return cf1
    return cf1 * (1 - mix) + cf2 * mix
}


// function find_closest_index(datetime_ms_by_index: number[], ms: number)
// {
//     let low = 0, high = datetime_ms_by_index.length - 1
//     if (datetime_ms_by_index.length === 0) throw new Error("No datetime data available")

//     if (ms <= datetime_ms_by_index[0]!) return 0
//     if (ms >= datetime_ms_by_index[high]!) return high
//     while (low <= high)
//     {
//         const mid = (low + high) >> 1
//         const v = datetime_ms_by_index[mid]!
//         if (v === ms) return mid
//         if (v < ms) low = mid + 1
//         else high = mid - 1
//     }
//     const a = datetime_ms_by_index[high]!, b = datetime_ms_by_index[low]!
//     return (Math.abs(a - ms) <= Math.abs(b - ms) ? high : low)
// }
