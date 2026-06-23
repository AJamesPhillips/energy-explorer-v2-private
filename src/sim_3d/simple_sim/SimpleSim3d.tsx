import { useFrame, useThree } from "@react-three/fiber"
import { cellArea, UNITS } from "h3-js"
import { useEffect, useState } from "react"
import * as THREE from "three"

// import uk_daily_power_demand_profiles from "../data/power_demand/uk/daily_profiles.json"
// import { uk_month_hourly_and_location_average_capacity_factor_solar_generation_2018 } from "../data/power_generation/solar_pv"
// import { uk_month_hourly_and_location_average_capacity_factor_wind_generation_2018 } from "../data/power_generation/wind_turbine"
import { BuildingActionType } from "../../state/building_action/interface"
import { BuildAction } from "../../state/power_plants/interface"
import { get_app_state, hacky_get_state } from "../../state/store"
import { get_uk_land_coverage_by_h3r5, LandH3Cell } from "../data/coverage_land/uk/data"
import { UK_EEZ_COORDS } from "../data/eez/data"
import { empty_aggregated_power_plant_data } from "../data/power_plants"
import { AggregatedPowerPlantData } from "../data/power_plants/interface"
import { promise_load_all_capacity_factor_data } from "../data/wind_and_solar_capacity/load_data"
import { CountryMap } from "../dev/CountryMap"
import { H3Grid } from "../dev/dgg/H3Grid"
import { H3LandCells } from "../dev/dgg/H3LandCells"
import { WorldAtlas } from "../dev/interface"
import { NEARBY_COUNTRY_IDS, UK_ID } from "../dev/map_data"
import { PowerPlantsCurrent } from "../dev/PowerPlantsCurrent"
import { init_model_power_supply_updates } from "../model"
import pub_sub from "../state/pub_sub"
import { sim_clock } from "../state/sim_clock"
import { CONSTANTS, DEFAULTS } from "./constants"
import { CellsData, H3R4ID } from "./interface"
import { IsoCamera } from "./IsoCamera"
import { H3ElectricalGrid } from "./map_components/H3ElectricalGrid"
import { H3GasGrid } from "./map_components/H3GasGrid"
import { MapLightningBoltFlow } from "./tile_power/MapLightningBoltFlow"



// const start_datetime = new Date("2018-06-01T00:00:00.000Z")
// const speed = 1000 * 60 * 60

const { CELL_SIZE, GRID_SIZE } = CONSTANTS
const { sun_args } = DEFAULTS

// // The visual grid was made from dropping half of the cells (all deep sea cells)
// const DROPPED_AREA = 2
// const KM2_PER_CELL = uk_coverage.total_uk.total_area_km2 / (GRID_SIZE.x * GRID_SIZE.y * DROPPED_AREA)
// const M2_PER_CELL = KM2_PER_CELL * 1e6
// function w_per_m2_to_gw_per_cell(w_per_m2: number): number
// {
//     return w_per_m2 * M2_PER_CELL / 1e9
// }
// // claimed power density
// const land_wind_turbines_w_per_m2 = 2 // https://wikisim.org/wiki/1275v1
// const offshore_wind_turbines_w_per_m2 = 3 // https://wikisim.org/wiki/1276
// const solar_farm_w_per_m2 = 5  // https://www.withouthotair.com/c6/page_41.shtml#:~:text=5%20W/m2
// const solar_built_area_w_per_m2 = 0.633 // W m-2 -- https://wikisim.org/wiki/1274



interface SimpleSim3dProps
{
    data: CellsData
    set_data: React.Dispatch<React.SetStateAction<CellsData>>
    // power: PowerStats
    // set_power: React.Dispatch<React.SetStateAction<PowerStats>>
}
export function SimpleSim3d(_props: SimpleSim3dProps)
{
    const [_load_error, set_load_error] = useState<string | null>(null)

    useThree(({ scene }) =>
    {
        scene.background = new THREE.Color(0xeeeeff)
    })


    const request_build_type = get_app_state(state => state.building_action.active)
    const update_build_action = get_app_state(state => state.power_plants.update_build_action)

    useEffect(() =>
    {
        if (!request_build_type) return

        return pub_sub.sub("on_click_tile", async (payload) =>
        {
            const cell_info = await get_cell_info_for_h3r4(payload.h3r4_id)
            if (!cell_info) return
            const build_action = make_build_action(request_build_type, cell_info)
            if (!build_action) return
            if (build_action.invalid_because)
            {
                console.warn(`Invalid action ${request_build_type.type} on cell ${payload.h3r4_id}: ${build_action.invalid_because}`)
                return
            }

            update_build_action(build_action)

            // const new_candidate_tile = modify_cell_with_action(cell, current_action)
            // const cell_valid = is_cell_valid(new_candidate_tile)
            // if (cell_valid !== true)
            // {
            //     pub_sub.pub("invalid_placement", {
            //         tile: cell,
            //         item_type: current_action.type,
            //         invalid_because: cell_valid.invalid_because,
            //     })
            //     return prev
            // }

            // const new_cell = new_candidate_tile
            // const new_cells: CellsData = {
            //     ...prev,
            //     [x]: {
            //         ...prev[x],
            //         [y]: new_cell
            //     },
            // }

            // const prev_power_supply = calculate_power_supply_from_data(prev)
            // const new_power_supply = calculate_power_supply_from_data(new_cells)
            // const change_in_supply_gw = new_power_supply - prev_power_supply

            // pub_sub.pub("will_update_tile", new_cell)
            // pub_sub.pub("tile_power_changed", { tile: new_cell, change_gw: change_in_supply_gw })

            // return new_cells
        })
    }, [request_build_type])

    // const on_hover_tile = useCallback((tile: CellData | null) =>
    // {
    //     pub_sub.pub("on_hover_tile", tile)
    // }, [])


    const [topo_data, set_topo_data] = useState<WorldAtlas | null>(null)
    // Fetch world atlas data
    useEffect(() => {
        // Stored from https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json
        fetch("data/countries/cdn.jsdelivr.net_npm_world-atlas@2_countries-50m.json")
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json() as Promise<WorldAtlas>
            })
            .then(set_topo_data)
            .catch((e) => set_load_error(e.message))
    }, [])

    const [h3r5_land_cells, set_h3r5_land_cells] = useState<LandH3Cell[]>([])
    useEffect(() =>
    {
        get_uk_land_coverage_by_h3r5().then(h3r5_land_cells =>
        {
            set_h3r5_land_cells(h3r5_land_cells)
        })
    }, [])


    const start_timestamp = get_app_state(state => state.game_datetime.start_timestamp)
    const current_timestamp = get_app_state(state => state.game_datetime.initial_timestamp)
    const end_timestamp = get_app_state(state => state.game_datetime.end_timestamp)
    useEffect(() =>
    {
        if (h3r5_land_cells.length === 0) return

        init_model_power_supply_updates(h3r5_land_cells)
        sim_clock.init({
            start_timestamp,
            current_timestamp,
            end_timestamp,
        })
    }, [h3r5_land_cells, start_timestamp, current_timestamp, end_timestamp])
    useFrame((state, delta) =>
    {
        const elapsed_seconds = state.clock.getElapsedTime()
        pub_sub.pub("animation_tick", {
            delta_seconds: delta,
            elapsed_seconds,
        })
    })

    const show_lightning_bolt_flow = get_app_state(state => state.game_datetime.speed.includes("fast") === false)
    const show = true

    return <>
        <IsoCamera grid_size={GRID_SIZE} cell_size={CELL_SIZE} />

        <ambientLight />
        <directionalLight position={sun_args.direct_position} />

        {show && <CountryMap
            topo_data={topo_data}
            country_id={UK_ID}
            other_country_ids={NEARBY_COUNTRY_IDS}
            outline_only={true}
            show_eez_boundary={false}
            // resolution_h3={resolution}
            // resolution_h3={resolution + 1}
        />}

        {show && <H3Grid
            EEZ_coords_lonlat={UK_EEZ_COORDS}
            resolution={4}
        />}

        {show && <H3LandCells
            h3_cells={h3r5_land_cells}
        />}

        {show && <PowerPlantsCurrent
            show_aggregated={true}
        />}

        {show_lightning_bolt_flow && <MapLightningBoltFlow />}

        {false && <H3ElectricalGrid />}
        {false && <H3GasGrid />}
    </>
}

// function modify_cell_with_action(cell: CellData, action: ActiveBuildingAction): CellData
// {
//     if (!action) return cell

//     if (action.type === "wind")
//     {
//         return { ...cell, has_wind_turbine: true }
//     }
//     else if (action.type === "solar")
//     {
//         return { ...cell, has_solar_farm: true }
//     }
//     else if (action.type === "oil_and_gas_rig")
//     {
//         return { ...cell, has_oil_rig: { state: "building", built_progress: 0 } }
//     }
//     // else if (action.type === "gas")
//     // {
//     //     return { ...cell, has_gas_power_plant: true }
//     // }
//     // else if (action.type === "nuclear")
//     // {
//     //     return { ...cell, has_nuclear_power_plant: true }
//     // }

//     // else if (action.type === "hydro_pumped_storage")
//     // {
//     //     return { ...cell, has_hydro_pumped_storage: true }
//     // }
//     // else if (action.type === "battery")
//     // {
//     //     return { ...cell, has_battery: true }
//     // }

//     return cell
// }


interface CellInfo extends H3R4ID
{
    cell_area_km2: number
    aggregated: AggregatedPowerPlantData
}

async function get_cell_info_for_h3r4(h3r4_id: string): Promise<CellInfo | undefined>
{
    const aggregated_by_h3r4 = hacky_get_state()?.power_plants.aggregated_by_h3r4
    if (!aggregated_by_h3r4)
    {
        console.error("No aggregated power plant data available")
        return
    }

    const { wind: wind_capacity_factor, solar: solar_pv_capacity_factor } = await promise_load_all_capacity_factor_data()

    const aggregated = aggregated_by_h3r4[h3r4_id] || empty_aggregated_power_plant_data(h3r4_id, wind_capacity_factor, solar_pv_capacity_factor)
    if (!aggregated)
    {
        console.error(`No aggregated power plant data for h3r4_id ${h3r4_id}`)
        return
    }

    const cell_area_km2 = cellArea(h3r4_id, UNITS.km2)

    return {
        h3r4_id,
        cell_area_km2,
        aggregated,
    }
}


type BuildActionOrFail = (BuildAction & { invalid_because?: never }) | {
    h3r4_id: string
    area_addable_km2?: never
    invalid_because: "water" | "no_oilgas"
}
function make_build_action(action: BuildingActionType, cell_info: CellInfo): BuildActionOrFail | undefined
{
    const power_type = action.type
    const { h3r4_id } = cell_info

    if (power_type === "wind" || power_type === "solar")
    {
        const current_area = cell_info.aggregated[power_type].area_km2
        if (current_area === undefined) return undefined
        return {
            h3r4_id,
            power_type,
            area_addable_km2: cell_info.cell_area_km2 - current_area,
            aggregated: cell_info.aggregated,
        }
    }

    console.warn(`make_build_action not implemented for action type ${action.type}`)

    // if (cell.h3r4_id)
    // {
    //     if (cell.type === "sea")
    //     {
    //         if (cell.subtype === "deep") return { invalid_because: "water" }
    //     }
    //     else
    //     {
    //         if (cell.subtype === "wetland" || cell.subtype === "inland_water") return { invalid_because: "water" }
    //     }
    // }

    // if (cell.has_solar_farm)
    // {
    //     if (cell.type === "sea") return { invalid_because: "water" }
    //     else
    //     {
    //         if (cell.subtype === "wetland" || cell.subtype === "inland_water") return { invalid_because: "water" }
    //     }
    // }

    // if (cell.has_oil_rig)
    // {
    //     if (cell.type !== "sea" || !cell.has_oil_pocket) return { invalid_because: "no_oilgas" }
    // }

    return undefined
}
