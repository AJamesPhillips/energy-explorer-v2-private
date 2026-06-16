import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { ILatLon, ILatLonWithIsOnshore } from "core/data/values/LatLon"

import { ModelData } from "../../model/interface"
import { solar_yellow_material, wind_blue_material } from "../../utils/colour"
import {
    convert_lat_lon_to_sphere as convert_lat_lon_to_sphere_orig
} from "../../utils/geo/convert_lat_lon_to_sphere"
import { CONSTANTS } from "../CONSTANTS"
import { find_hex_grid_mid_points } from "./find_hex_grid_mid_points"
import { find_nearest_neighbours } from "./find_nearest_neighbours"
import { load_model_data } from "./load_model_data"
import { order_in_circular } from "./order_in_circular"


const DEFAULT_CELL_MATERIAL = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0,
    side: THREE.BackSide,
})

const WIND_SCALE = 1 / 0.991
const SOLAR_SCALE = 1 / 0.891


export function SpatialData()
{
    const [model_data, set_model_data] = useState<ModelData | null>(null)

    useEffect(() =>
    {
        load_model_data()
        .then(model_data =>
        {
            set_model_data(model_data)
        })
    }, [])

    if (!model_data) return null

    return <DataAreaVisuals model_data={model_data} />
}


interface ConfigOfDisplay
{
    datetime_ms: number
    data_type: "wind" | "solar"
}


function DataAreaVisuals({ model_data }: { model_data: ModelData })
{
    const mesh_refs = useRef<(THREE.Mesh | null)[]>([])

    const cell_data = useMemo(() =>
    {
        const { onshore_lat_lons, offshore_lat_lons } = model_data
        const all_lat_lons = [...offshore_lat_lons, ...onshore_lat_lons]
        const spatial_data_grid_with_nn = find_nearest_neighbours(all_lat_lons, 43)

        const cells: { geometry: THREE.BufferGeometry; lat_lon: ILatLonWithIsOnshore }[] = []

        spatial_data_grid_with_nn.forEach(lat_lon =>
        {
            const circular_ordered = order_in_circular(spatial_data_grid_with_nn, lat_lon.nearest)
            const mid_points = find_hex_grid_mid_points(lat_lon, spatial_data_grid_with_nn, circular_ordered, true)
            if (!mid_points) return

            const vertices = mid_points
                .map(convert_lat_lon_to_sphere)
                .flatMap(v => [v.x, v.y, v.z])

            const indices: number[] = [
                0, 1, 2,
                0, 2, 3,
                0, 3, 5,
                3, 4, 5,
            ]

            const geometry = new THREE.BufferGeometry()
            geometry.setIndex(indices)
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))

            cells.push({ geometry, lat_lon })
        })

        return cells
    }, [model_data])

    const { datetime_range } = model_data
    const datetime_steps = datetime_range.size()
    const config_ref = useRef<ConfigOfDisplay>({
        datetime_ms: datetime_range.get_time_stamps()[Math.round(datetime_steps / 2)]!,
        data_type: "wind",
    })
    const animation_state_ref = useRef({
        datetime_index: Math.round(datetime_steps / 2),
        last_animated_at_seconds: -Infinity,
        animate_fps: 10,
    })

    useFrame(({ clock }) =>
    {
        const elapsed_seconds = clock.getElapsedTime()
        const state = animation_state_ref.current

        if (!state.animate_fps) return
        if ((elapsed_seconds - state.last_animated_at_seconds) < (1 / state.animate_fps)) return
        state.last_animated_at_seconds = elapsed_seconds

        state.datetime_index = (state.datetime_index + 1) % datetime_steps
        config_ref.current.datetime_ms = datetime_range.get_time_stamps()[state.datetime_index]!

        update_cell_colours(model_data, cell_data, mesh_refs.current, config_ref.current)
    })

    return <>
        {cell_data.map(({ geometry }, i) => (
            <mesh
                key={i}
                ref={el => { mesh_refs.current[i] = el }}
                geometry={geometry}
                material={DEFAULT_CELL_MATERIAL}
            />
        ))}
    </>
}


const country_surface_radius = CONSTANTS.countries.surface_radius
function convert_lat_lon_to_sphere(lat_lon: ILatLon)
{
    return convert_lat_lon_to_sphere_orig(lat_lon.lat, lat_lon.lon, country_surface_radius)
}


function update_cell_colours(
    model_data: ModelData,
    cell_data: { lat_lon: ILatLonWithIsOnshore }[],
    meshes: (THREE.Mesh | null)[],
    config: ConfigOfDisplay,
)
{
    const {
        hourly_capacity_factor_wind_generation: { onshore: wind_onshore, offshore: wind_offshore },
        hourly_capacity_factor_solar_generation,
    } = model_data

    const { datetime_ms, data_type } = config
    const show_wind = data_type === "wind"

    cell_data.forEach(({ lat_lon }, i) =>
    {
        const mesh = meshes[i]
        if (!mesh) return

        let material: THREE.Material
        if (show_wind)
        {
            const wind = lat_lon.is_onshore
                ? wind_onshore.get({ datetime_ms, lat_lon })!
                : wind_offshore.get({ datetime_ms, lat_lon })!
            material = wind_blue_material(wind * WIND_SCALE)
        }
        else if (lat_lon.is_onshore)
        {
            const solar = hourly_capacity_factor_solar_generation.get({ datetime_ms, lat_lon })!
            material = solar_yellow_material(solar * SOLAR_SCALE)
        }
        else material = DEFAULT_CELL_MATERIAL

        mesh.material = material
        ;(mesh.material as THREE.Material).needsUpdate = true
    })
}
