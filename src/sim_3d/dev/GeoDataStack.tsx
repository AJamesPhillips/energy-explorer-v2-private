import { Canvas } from "@react-three/fiber"
import * as h3 from "h3-js"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { UK_EEZ_COORDS } from "../data/eez/data"
import { H3_RESOLUTION } from "../data/power_plants"
import { load_solar_pv_capacity_data, load_wind_turbine_capacity_data } from "../data/wind_and_solar_capacity/load_data"
import { CONSTANTS, DEFAULTS } from "../simple_sim/constants"
import { InitialiseGeometriesEtc } from "../simple_sim/InitialiseGeometriesEtc"
import { IsoCamera } from "../simple_sim/IsoCamera"
import { aggregate_to_annual_average, CapacityFactorData, get_ombre_of_capacity_factors } from "../utils/capacity_factor_data"
import { CountryMap } from "./CountryMap"
import { H3Grid } from "./dgg/H3Grid"
import "./GeoDataStack.css"
import { WorldAtlas } from "./interface"
import { NEARBY_COUNTRY_IDS, UK_ID } from "./map_data"
import { PowerPlantsCurrent } from "./PowerPlantsCurrent"

const { GRID_SIZE } = CONSTANTS
const { sun_args } = DEFAULTS


export function GeoDataStack()
{
    const [resolution, set_resolution] = useState(H3_RESOLUTION)
    const [cell_count, set_cell_count] = useState(0)
    const [is_computing, _set_is_computing] = useState(false)
    const [topo_data, set_topo_data] = useState<WorldAtlas | null>(null)
    const [load_error, set_load_error] = useState<string | null>(null)
    const [wind_turbine_capacity_data, set_wind_turbine_capacity_data] = useState<CapacityFactorData | null>(null)
    const [annual_wind_turbine_capacity_data, set_annual_wind_turbine_capacity_data] = useState<CapacityFactorData | null>(null)
    const [solar_pv_capacity_data, set_solar_pv_capacity_data] = useState<CapacityFactorData | null>(null)
    const [annual_solar_pv_capacity_data, set_annual_solar_pv_capacity_data] = useState<CapacityFactorData | null>(null)

    // Fetch world atlas once
    useEffect(() => {
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json() as Promise<WorldAtlas>
            })
            .then(set_topo_data)
            .catch((e) => set_load_error(e.message))
    }, [])


    useEffect(() =>
    {
        load_wind_turbine_capacity_data().then(wind_turbine_capacity_data =>
        {
            set_wind_turbine_capacity_data(wind_turbine_capacity_data)
            // const annual = aggregate_to_annual_average(wind_turbine_capacity_data)
            const annual = get_ombre_of_capacity_factors(wind_turbine_capacity_data)
            set_annual_wind_turbine_capacity_data(annual)
        })
        load_solar_pv_capacity_data().then(solar_pv_capacity_data =>
        {
            set_solar_pv_capacity_data(solar_pv_capacity_data)
            const annual = aggregate_to_annual_average(solar_pv_capacity_data)
            set_annual_solar_pv_capacity_data(annual)
        })
    }, [])

    const sun_ambient_ref = useRef<THREE.AmbientLight>(null)
    const sun_directional_ref = useRef<THREE.DirectionalLight>(null)


    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080f1c]">
            <Header load_error={load_error} topo_data={topo_data} />
            <h1>{resolution}</h1>
            <Canvas id="scene_3d">
                <InitialiseGeometriesEtc />

                <IsoCamera grid_size={GRID_SIZE} cell_size={20} />

                <ambientLight ref={sun_ambient_ref} />
                <directionalLight ref={sun_directional_ref} position={sun_args.direct_position} />

                <CountryMap
                    topo_data={topo_data}
                    country_id={UK_ID}
                    other_country_ids={NEARBY_COUNTRY_IDS}
                    // show_eez_boundary={true}
                    // resolution_h3={resolution}
                    // resolution_h3={resolution + 1}
                />

                <H3Grid
                    EEZ_coords_lonlat={UK_EEZ_COORDS}
                    resolution={resolution}
                    set_cell_count={set_cell_count}
                    // capacity_data={{ data: wind_turbine_capacity_data, type: "wind" }}
                    capacity_data={{ data: annual_wind_turbine_capacity_data, type: "solar" }}
                    // capacity_data={{ data: solar_pv_capacity_data, type: "solar" }}
                    // capacity_data={{ data: annual_solar_pv_capacity_data, type: "solar" }}
                />

                <PowerPlantsCurrent
                    show_aggregated={true}
                />
            </Canvas>
            <Controls
                cell_count={cell_count}
                resolution={resolution}
                is_computing={is_computing}
                set_resolution={set_resolution}
            />
        </div>
    );
}


function Header(props: { load_error: string | null, topo_data: WorldAtlas | null })
{
    return <header className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-[#1e3d5a]">
        <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#c8e6f8]">
                UK H3 Discrete Global Grid
            </h1>
            <p className="text-xs text-[#4a7fa8] mt-0.5">
                H3 hexagonal grid over the UK Exclusive Economic Zone
            </p>
        </div>
        {props.load_error && (
            <span className="text-xs text-red-400 bg-red-900/30 px-3 py-1 rounded-md">
                Failed to load map data: {props.load_error}
            </span>
        )}
        {!props.topo_data && !props.load_error && (
            <span className="text-xs text-[#4a9eda] animate-pulse">Loading map data…</span>
        )}
    </header>
}


interface ControlsProps
{
    cell_count: number
    resolution: number
    is_computing: boolean
    set_resolution: (r: number) => void
}
function Controls(props: ControlsProps)
{
    const { cell_count, resolution, is_computing, set_resolution } = props

    return <div className="controls_above_canvas">
        {/* Resolution slider */}
        <div>
            <label>
                Resolution
                <span> {resolution}</span>
                <span> — {resolution_label(resolution)} </span>
            </label>
            <span >
                {is_computing ? "computing…" : `${cell_count.toLocaleString()} cells`}
            </span>
        </div>
        <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={resolution}
            onChange={(e) => set_resolution(Number(e.target.value))}
            style={{
                background: `linear-gradient(to right, #4a9eda ${(resolution / 6) * 100}%, #1e3d5a ${(resolution / 6) * 100}%)`,
            }}
        />
        <div>
            {[0,1,2,3,4,5,6].map((r) => (
                <button
                    key={r}
                    onClick={() => set_resolution(r)}
                >
                    {r}
                </button>
            ))}
        </div>

        <StatsRow resolution={resolution} cell_count={cell_count} />
    </div>
}


function resolution_label(res: number): string
{
    const labels = ["0 - continental","1 - country","2 - large region","3 - region","4 - county","5 - district","6 - neighbourhood"]
    return labels[res] ?? `${res}`
}


function StatsRow(props: { resolution: number, cell_count: number })
{
    const avg_area = h3.getHexagonAreaAvg(props.resolution, "km2")

    return <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0d1e35] border border-[#1e3d5a] rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-[#4a7fa8] mb-1">Resolution</div>
            <div className="font-mono text-xl text-[#4a9eda] font-semibold">{props.resolution}</div>
        </div>
        <div className="bg-[#0d1e35] border border-[#1e3d5a] rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-[#4a7fa8] mb-1">Avg Cell Area</div>
            <div className="font-mono text-base text-[#c8e6f8] font-semibold leading-tight mt-0.5">
                {format_area(avg_area)}
            </div>
        </div>
        <div className="bg-[#0d1e35] border border-[#1e3d5a] rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-[#4a7fa8] mb-1">EEZ Coverage</div>
            <div className="font-mono text-base text-[#c8e6f8] font-semibold leading-tight mt-0.5">
                {props.cell_count.toLocaleString()} cells
            </div>
        </div>
    </div>
}

// H3 average cell areas in km² (from h3-js getHexagonAreaAvg)
function format_area(km2: number): string {
    if (km2 >= 1_000_000) return `${(km2 / 1_000_000).toFixed(2)} M km²`;
    // if (km2 >= 1_000) return `${(km2 / 1_000).toFixed(1)} k km²`;
    if (km2 >= 1) return `${km2.toFixed(2)} km²`;
    return `${(km2 * 1_000_000).toFixed(0)} m²`;
}
