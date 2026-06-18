import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"
import * as THREE from "three"

// import uk_daily_power_demand_profiles from "../data/power_demand/uk/daily_profiles.json"
// import { uk_month_hourly_and_location_average_capacity_factor_solar_generation_2018 } from "../data/power_generation/solar_pv"
// import { uk_month_hourly_and_location_average_capacity_factor_wind_generation_2018 } from "../data/power_generation/wind_turbine"
import { uk_coverage } from "../data/coverage/uk/data"
import { get_uk_land_coverage, LandH3Cell } from "../data/coverage_land/uk/data"
import { CountryMap } from "../dev/CountryMap"
import { H3LandCells } from "../dev/dgg/H3LandCells"
import { WorldAtlas } from "../dev/interface"
import { NEARBY_COUNTRY_IDS, UK_ID } from "../dev/map_data"
import { PowerPlantsCurrent } from "../dev/PowerPlantsCurrent"
import { PowerStats } from "../model/old_interface"
import pub_sub from "../state/pub_sub"
import { sim_clock } from "../state/sim_clock"
import { CONSTANTS, DEFAULTS } from "./constants"
import { CellDataV1, CellsData } from "./interface"
import { IsoCamera } from "./IsoCamera"
import { WindSolarH3Grid } from "./WindSolarH3Grid"



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



interface SimpleSim3dProps
{
    data: CellsData
    set_data: React.Dispatch<React.SetStateAction<CellsData>>
    // power: PowerStats
    set_power: React.Dispatch<React.SetStateAction<PowerStats>>
}
export function SimpleSim3d(props: SimpleSim3dProps)
{
    const [_load_error, set_load_error] = useState<string | null>(null)

    useThree(({ scene }) =>
    {
        scene.background = new THREE.Color(0xeeeeff)
    })


    useEffect(() =>
    {
        sim_clock.init({
            start_timestamp: new Date("2026-06-01T00:00:00.000Z").getTime(),
            current_timestamp: new Date("2026-06-01T09:00:00.000Z").getTime(),
            end_timestamp: new Date("2026-06-15T00:00:00.000Z").getTime(),
        })
    }, [])
    useFrame((state, delta) =>
    {
        const elapsed_seconds = state.clock.getElapsedTime()
        pub_sub.pub("animation_tick", {
            delta_seconds: delta,
            elapsed_seconds,
        })
    })


    // const state = get_app_state()
    // const current_action = state.building_action.active

    // const on_click_tile = useCallback(({ x, y }: { x: number; y: number }) =>
    // {
    //     props.set_data(prev =>
    //     {
    //         const cell = prev[x]?.[y]
    //         if (!cell) return prev

    //         if (!current_action) return prev

    //         const new_candidate_tile = modify_cell_with_action(cell, current_action)
    //         const cell_valid = is_cell_valid(new_candidate_tile)
    //         if (cell_valid !== true)
    //         {
    //             pub_sub.pub("invalid_placement", {
    //                 tile: cell,
    //                 item_type: current_action.type,
    //                 invalid_because: cell_valid.invalid_because,
    //             })
    //             return prev
    //         }

    //         const new_cell = new_candidate_tile
    //         const new_cells: CellsData = {
    //             ...prev,
    //             [x]: {
    //                 ...prev[x],
    //                 [y]: new_cell
    //             },
    //         }

    //         const prev_power_supply = calculate_power_supply_from_data(prev)
    //         const new_power_supply = calculate_power_supply_from_data(new_cells)
    //         const change_in_supply_gw = new_power_supply - prev_power_supply

    //         pub_sub.pub("will_update_tile", new_cell)
    //         pub_sub.pub("tile_power_changed", { tile: new_cell, change_gw: change_in_supply_gw })

    //         return new_cells
    //     })
    // }, [current_action])

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

    const [h3_land_cells, set_h3_land_cells] = useState<LandH3Cell[]>([])
    useEffect(() =>
    {
        get_uk_land_coverage().then(h3_land_cells =>
        {
            set_h3_land_cells(h3_land_cells)
        })
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
        <IsoCamera grid_size={GRID_SIZE} cell_size={CELL_SIZE} />

        <ambientLight />
        <directionalLight position={sun_args.direct_position} />

        <CountryMap
            topo_data={topo_data}
            country_id={UK_ID}
            other_country_ids={NEARBY_COUNTRY_IDS}
            outline_only={true}
            // show_eez_boundary={true}
            // resolution_h3={resolution}
            // resolution_h3={resolution + 1}
        />

        <WindSolarH3Grid />

        {true && <H3LandCells
            h3_cells={h3_land_cells}
        />}

        <PowerPlantsCurrent
            show_aggregated={true}
        />
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


// function is_cell_valid(cell: CellData): true | { invalid_because: "water" | "no_oilgas" }
// {
//     if (cell.has_wind_turbine)
//     {
//         if (cell.type === "sea")
//         {
//             if (cell.subtype === "deep") return { invalid_because: "water" }
//         }
//         else
//         {
//             if (cell.subtype === "wetland" || cell.subtype === "inland_water") return { invalid_because: "water" }
//         }
//     }

//     if (cell.has_solar_farm)
//     {
//         if (cell.type === "sea") return { invalid_because: "water" }
//         else
//         {
//             if (cell.subtype === "wetland" || cell.subtype === "inland_water") return { invalid_because: "water" }
//         }
//     }

//     if (cell.has_oil_rig)
//     {
//         if (cell.type !== "sea" || !cell.has_oil_pocket) return { invalid_because: "no_oilgas" }
//     }

//     return true
// }


function calculate_power_supply_from_data(data: CellsData): number
{
    let supply_gw = 0

    Object.values(data).forEach(column =>
    {
        Object.values(column).forEach(cell_ =>
        {
            const cell = cell_ as CellDataV1

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
