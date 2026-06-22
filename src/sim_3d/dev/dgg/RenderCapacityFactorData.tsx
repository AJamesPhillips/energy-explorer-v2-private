import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import * as THREE from "three"

import { get_app_state } from "../../../state/store"
import { promise_load_all_capacity_factor_data } from "../../data/wind_and_solar_capacity/load_data"
import pub_sub from "../../state/pub_sub"
import { CapacityData, CapacityFactorData, get_capacity_factor_mix } from "../../utils/capacity_factor_data"


export function RenderCapacityFactorData(props: {
    coords: {
        // merged_fill: THREE.BufferGeometry | null
        // merged_outline: THREE.BufferGeometry | null
        cell_ids: string[]
        cell_vertex_ranges: { start: number; count: number }[]
    }
    merged_mesh_ref: RefObject<THREE.Mesh | null>
    shader_material: THREE.ShaderMaterial
    palettes: { wind: THREE.Vector4[]; solar: THREE.Vector4[] }
})
{
    const { coords, merged_mesh_ref, shader_material, palettes } = props

    const map_capacity_factors_source = get_app_state(state => state.view.map_capacity_factors_source)
    const map_capacity_factors_aggregation = get_app_state(state => state.view.map_capacity_factors_aggregation)
    const map_capacity_factors_discrete = get_app_state(state => state.view.map_capacity_factors_discrete)

    const [wind_turbine_capacity_data, set_wind_turbine_capacity_data] = useState<CapacityFactorData | null>(null)
    const [annual_wind_turbine_capacity_data, set_annual_wind_turbine_capacity_data] = useState<CapacityFactorData | null>(null)
    const [solar_pv_capacity_data, set_solar_pv_capacity_data] = useState<CapacityFactorData | null>(null)
    const [annual_solar_pv_capacity_data, set_annual_solar_pv_capacity_data] = useState<CapacityFactorData | null>(null)
    useEffect(() =>
    {
        promise_load_all_capacity_factor_data().then(({ wind, annual_wind, solar, annual_solar}) =>
        {
            set_wind_turbine_capacity_data(wind)
            set_annual_wind_turbine_capacity_data(annual_wind)
            set_solar_pv_capacity_data(solar)
            set_annual_solar_pv_capacity_data(annual_solar)
        })
    }, [])

    const capacity_data: CapacityData | undefined = useMemo(() =>
    {
        if (!map_capacity_factors_source) return undefined
        if (!wind_turbine_capacity_data) return undefined
        if (!annual_wind_turbine_capacity_data) return undefined
        if (!solar_pv_capacity_data) return undefined
        if (!annual_solar_pv_capacity_data) return undefined

        const capacity_data: CapacityData = {
            data: wind_turbine_capacity_data,
            type: "wind",
            display_type: map_capacity_factors_discrete ? "discrete" : "continuous",
        }

        if (map_capacity_factors_source === "wind")
        {
            capacity_data.data = map_capacity_factors_aggregation === "annual_average"
                ? annual_wind_turbine_capacity_data
                : wind_turbine_capacity_data
            return capacity_data
        }

        capacity_data.type = "solar"
        capacity_data.data = map_capacity_factors_aggregation === "annual_average"
            ? annual_solar_pv_capacity_data
            : solar_pv_capacity_data

        return capacity_data
    }, [map_capacity_factors_source, map_capacity_factors_aggregation, wind_turbine_capacity_data, annual_wind_turbine_capacity_data, solar_pv_capacity_data, annual_solar_pv_capacity_data])


    const animation_state_ref = useRef({
        last_animated_at_ms: -Infinity,
        animate_fps: 10,
    })

    useEffect(() =>
    {
        if (!capacity_data?.data)
        {
            // Clear the palette and set all palette indices to 0
            apply_capacity_palette_and_indices({
                mesh: merged_mesh_ref.current,
                coords,
                shader_material,
                palettes,
            })
            return
        }

        // Build an index -> ms array for fast lookup (ordered by index)
        const datetime_ms_by_index: number[] = new Array(capacity_data.data.date_time_to_index.size)
        capacity_data.data.date_time_to_index.forEach((idx, date_time) => {
            datetime_ms_by_index[idx] = Date.parse(date_time)
        })

        const state = animation_state_ref.current

        const unsub = pub_sub.sub("simulation_datetime", payload => {
            const now = performance.now()
            if (!state.animate_fps) return
            if ((now - state.last_animated_at_ms) < (1000 / state.animate_fps)) return
            state.last_animated_at_ms = now

            apply_capacity_palette_and_indices({
                mesh: merged_mesh_ref.current,
                coords,
                shader_material,
                palettes,
                capacity_data,
                datetime_index1: payload.datetime_annual_hourly_index1,
                datetime_index2: payload.datetime_annual_hourly_index2,
                datetime_index_mix: payload.datetime_annual_hourly_index_mix,
            })
        }, "H3Cells-sim")

        return unsub
    }, [capacity_data, coords.cell_ids, coords.cell_vertex_ranges, palettes, shader_material, merged_mesh_ref])

    return null
}



function apply_capacity_palette_and_indices(params: {
    mesh: THREE.Mesh | null
    coords: { cell_ids: string[]; cell_vertex_ranges: { start: number; count: number }[] }
    shader_material: THREE.ShaderMaterial
    palettes: { wind: THREE.Vector4[]; solar: THREE.Vector4[] }
    capacity_data?: CapacityData | null
    datetime_index1?: number
    datetime_index2?: number
    datetime_index_mix?: number
}) {
    const {
        mesh,
        coords,
        shader_material,
        palettes,
        capacity_data,
        datetime_index1 = 0,
        datetime_index2 = 0,
        datetime_index_mix = 0,
    } = params

    if (!mesh) return
    const geom = mesh.geometry as THREE.BufferGeometry | null
    if (!geom || !coords.cell_ids || !coords.cell_vertex_ranges) return

    const attr = geom.getAttribute("palette_index") as THREE.BufferAttribute | undefined
    if (!attr) return
    const arr = attr.array as Float32Array

    const pad_palette = (p: THREE.Vector4[]) => {
        const out: THREE.Vector4[] = p.slice(0, 8).map(v => new THREE.Vector4(v.x, v.y, v.z, (v.w === undefined ? 1 : v.w)))
        while (out.length < 8) out.push(new THREE.Vector4(0, 0, 0, 0))
        return out
    }

    const data = capacity_data?.data
    if (!data)
    {
        const base = (palettes.wind && palettes.wind.length) ? palettes.wind : palettes.solar
        const clear_palette = pad_palette(base.map(v => new THREE.Vector4(v.x, v.y, v.z, 0)))
        ;(shader_material.uniforms as any).palette.value = clear_palette
        for (let i = 0; i < arr.length; i++) arr[i] = 0
        attr.needsUpdate = true
        return
    }

    const palette = capacity_data.type === "wind" ? palettes.wind : palettes.solar
    ;(shader_material.uniforms as any).palette.value = pad_palette(palette)

    const palette_count = Math.max(1, palette.length)
    coords.cell_ids.forEach((cell_id, i) => {
        const capacity_factor = get_capacity_factor_mix(data, datetime_index1, datetime_index2, datetime_index_mix, cell_id) ?? 0
        const idxf = capacity_data.display_type === "continuous"
            ? capacity_factor * (palette_count - 1)
            : Math.round(capacity_factor * (palette_count - 1))

        const range = coords.cell_vertex_ranges[i]!
        const start = range.start
        const end = start + range.count
        for (let v = start; v < end; v++) arr[v] = idxf
    })

    attr.needsUpdate = true
}
