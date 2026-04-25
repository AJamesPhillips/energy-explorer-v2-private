import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { uk_coverage } from "../data/coverage/uk/data"
// import uk_daily_power_demand_profiles from "../data/power_demand/uk/daily_profiles.json"
// import { uk_month_hourly_and_location_average_capacity_factor_solar_generation_2018 } from "../data/power_generation/solar_pv"
// import { uk_month_hourly_and_location_average_capacity_factor_wind_generation_2018 } from "../data/power_generation/wind_turbine"
import { PerspectiveKnowledgeGraph } from "../../data/interface"
import { PowerStats } from "../model/interface"
import pub_sub from "../state/pub_sub"
import { CONSTANTS, DEFAULTS } from "./constants"
import { FooterLinks } from "./FooterLinks"
import { CellData, CellsData } from "./interface"
import { IsoCamera } from "./IsoCamera"
import { IsoMetricGrid } from "./IsoMetricGrid"
import { map_data_cells } from "./map_data"
import { PowerStatus } from "./PowerStatus"
import { VisualKey } from "./VisualKey"
import { WelcomeMessage } from "./WelcomeMessage"


// const start_datetime = new Date("2018-06-01T00:00:00.000Z")
// const speed = 1000 * 60 * 60

const { CELL_SIZE, GRID_SIZE } = CONSTANTS
const { sun_args } = DEFAULTS
// The visual grid was made from dropping half of the cells (all deep sea cells)
const DROPPED_AREA = 2
const KM2_PER_CELL = uk_coverage.total_uk.total_area_km2 / (GRID_SIZE.x * GRID_SIZE.y * DROPPED_AREA)
const M2_PER_CELL = KM2_PER_CELL * 1e6
function w_per_m2_to_gw_per_cell(w_per_m2: number): number
{
    return w_per_m2 * M2_PER_CELL / 1e9
}
// claimed power density
const land_wind_turbines_w_per_m2 = 2 // https://wikisim.org/wiki/1275v1
const offshore_wind_turbines_w_per_m2 = 3 // https://wikisim.org/wiki/1276
const solar_farm_w_per_m2 = 5  // https://www.withouthotair.com/c6/page_41.shtml#:~:text=5%20W/m2
const solar_built_area_w_per_m2 = 0.633 // W m-2 -- https://wikisim.org/wiki/1274

const hours_per_day = 24
// TODO: move this into WikiSim
function convert_kwh_pd_pp_to_gw(args: { kwh_per_day_per_person: number, population: number })
{
    const kwh_per_day = args.kwh_per_day_per_person * args.population
    const kw = kwh_per_day / hours_per_day
    return kw / 1e6
}


export function SimpleSim(props: { persective: PerspectiveKnowledgeGraph | undefined, population: number | undefined })
{
    // const power_demand_series = useMemo(() => uk_daily_power_demand_profiles["2010"].average_demand.data, [])

    const [power, set_power] = useState<PowerStats>({
        demand_gw: 0, //Math.round(power_demand_series[3]![2]! as number / 1e3),
        supply_gw: 0,
    })

    const [data, set_data] = useState<CellsData>(() => map_data_cells)

    useEffect(() =>
    {
        if (!props.persective || !props.population) return

        const { id, version } = props.persective.graph.apex_id
        const id_str = `${id}v${version}`
        const node = props.persective.graph.nodes[id_str]
        const computed_value = JSON.parse(node!.component.computed_value!)
        const kwh_per_day_per_person = computed_value.total_demand
        const demand_gw = convert_kwh_pd_pp_to_gw({ kwh_per_day_per_person, population: props.population })

        set_power(existing => ({
            ...existing,
            demand_gw,
        }))
    }, [props.persective?.graph, props.population])


    return <>
        <Canvas id="scene-3d">
            <SimpleSim3d
                data={data}
                set_data={set_data}
                // power={power}
                set_power={set_power}
            />
        </Canvas>

        <PowerStatus view="simulation" power={power} />
        <WelcomeMessage />
        <VisualKey />
        <FooterLinks />
    </>
}


interface SimpleSim3dProps
{
    data: CellsData
    set_data: React.Dispatch<React.SetStateAction<CellsData>>
    // power: PowerStats
    set_power: React.Dispatch<React.SetStateAction<PowerStats>>
}
function SimpleSim3d(props: SimpleSim3dProps)
{
    // const [datetime, set_datetime] = useState(start_datetime)
    const sun_ambient_ref = useRef<THREE.AmbientLight>(null)
    const sun_directional_ref = useRef<THREE.DirectionalLight>(null)

    useThree(({ scene }) =>
    {
        scene.background = new THREE.Color(0xeeeeff)
    })

    useFrame((state, delta) =>
    {
        // const new_datetime = new Date(datetime.getTime() + (delta * speed))
        // set_datetime(new_datetime)

        // const sun_args = sun_light_colour_and_intensity_from_datetime_and_latlon(new_datetime, lat_lon, false)
        if (sun_ambient_ref.current)
        {
            sun_ambient_ref.current.color = new THREE.Color(sun_args.colour)
            sun_ambient_ref.current.intensity = sun_args.ambient_intensity
        }
        if (sun_directional_ref.current)
        {
            sun_directional_ref.current.color = new THREE.Color(sun_args.colour)
            sun_directional_ref.current.intensity = sun_args.direct_intensity
        }

        pub_sub.pub("animation_tick", {
            delta_seconds: delta,
            elapsed_seconds: state.clock.getElapsedTime(),
        })
    })


    const on_click_tile = useCallback(({ x, y }: { x: number; y: number }) =>
    {
        props.set_data(prev =>
        {
            const cell = prev[x]?.[y]
            if (!cell) return prev

            const new_cell = cycle_cell_contents(cell)
            const new_cells: CellsData = {
                ...prev,
                [x]: {
                    ...prev[x],
                    [y]: new_cell
                },
            }

            const prev_power_supply = calculate_power_supply_from_data(prev)
            const new_power_supply = calculate_power_supply_from_data(new_cells)
            const change_in_supply_gw = new_power_supply - prev_power_supply

            pub_sub.pub("will_update_tile", new_cell)
            pub_sub.pub("tile_power_changed", { tile: new_cell, change_gw: change_in_supply_gw })

            return new_cells
        })
    }, [])

    const on_hover_tile = useCallback((tile: CellData | null) =>
    {
        pub_sub.pub("on_hover_tile", tile)
    }, [])

    useEffect(() =>
    {
        const new_power_supply = calculate_power_supply_from_data(props.data)
        props.set_power(existing => ({
            supply_gw: new_power_supply,
            demand_gw: existing.demand_gw,
        }))
    }, [props.data])

    return <>
        <IsoCamera grid_size={GRID_SIZE} cell_size={CELL_SIZE} position_xy={{ x: 5, y: 5 }} />
        <ambientLight ref={sun_ambient_ref} />
        <directionalLight ref={sun_directional_ref} position={sun_args.direct_position} />

        <IsoMetricGrid
            size={GRID_SIZE}
            cell_size={CELL_SIZE}
            data={props.data}
            on_click_tile={on_click_tile}
            on_hover_tile={on_hover_tile}
        />
        <Data />
    </>
}



function Data ()
{

    // const wind = useMemo(() => uk_month_hourly_and_location_average_capacity_factor_wind_generation_2018(), [])
    // const solar = useMemo(() => uk_month_hourly_and_location_average_capacity_factor_solar_generation_2018(), [])

    // console.log("coverage", coverage)

    return <></>
}


function cycle_cell_contents(cell: CellData): CellData
{
    if (cell.type === "sea" && cell.subtype === "shallow")
    {
        if (!cell.has_wind_turbine)
        {
            return { ...cell, has_wind_turbine: true }
        }
        else
        {
            return { ...cell, has_wind_turbine: false }
        }
    }
    else if (cell.type === "land" && (cell.subtype !== "wetland" && cell.subtype !== "inland_water"))
    {
        if (!cell.has_solar_farm && !cell.has_wind_turbine)
        {
            return { ...cell, has_solar_farm: true }
        }
        else if (!cell.has_wind_turbine)
        {
            return { ...cell, has_solar_farm: true, has_wind_turbine: true }
        }
        else if (cell.has_solar_farm && cell.has_wind_turbine)
        {
            return { ...cell, has_solar_farm: false, has_wind_turbine: true }
        }
        else
        {
            return { ...cell, has_solar_farm: false, has_wind_turbine: false }
        }
    }
    return cell
}


function calculate_power_supply_from_data(data: CellsData): number
{
    let supply_gw = 0

    Object.values(data).forEach(column =>
    {
        Object.values(column).forEach(cell_ =>
        {
            const cell = cell_ as CellData

            if (cell.type === "sea" && cell.has_wind_turbine)
            {
                supply_gw += w_per_m2_to_gw_per_cell(offshore_wind_turbines_w_per_m2)
            }
            else if (cell.type === "land")
            {
                if (cell.has_wind_turbine)
                {
                    supply_gw += w_per_m2_to_gw_per_cell(land_wind_turbines_w_per_m2)
                }
                if (cell.has_solar_farm)
                {
                    if (cell.subtype === "suburban" || cell.subtype === "urban")
                    {
                        supply_gw += w_per_m2_to_gw_per_cell(solar_built_area_w_per_m2)
                    }
                    else
                    {
                        supply_gw += w_per_m2_to_gw_per_cell(solar_farm_w_per_m2)
                    }
                }
            }
        })
    })

    return supply_gw
}
