import { cellArea, UNITS } from "h3-js"
import { useEffect, useState } from "react"

import { CloseIcon } from "../../../components/svgs"
import { get_app_state } from "../../../state/store"
import { is_on_localhost } from "../../../utils/is_on_localhost"
import { to_sentence_case } from "../../../utils/string"
import { promise_load_all_capacity_factor_data } from "../../data/wind_and_solar_capacity/load_data"
import { MWGenCapStoreForH3R4, POWER_TYPES } from "../../model/interface"
import pub_sub from "../../state/pub_sub"
import { get_capacity_factor_mix } from "../../utils/capacity_factor_data"
import { COLOURS } from "../constants"
import "./CellInfo.css"


const show_H3_cell_id = true || is_on_localhost()


export function CellInfo()
{
    const h3r4_id = get_app_state(state => state.view.h3r4_cell_info_open)
    const set_cell_info_open = get_app_state(state => state.view.set_h3r4_cell_info_open)
    const map_capacity_factors_source = get_app_state(state => state.view.map_capacity_factors_source)
    const map_capacity_factors_aggregation = get_app_state(state => state.view.map_capacity_factors_aggregation)

    const [cell_info, set_cell_info] = useState<null | {
        h3r4_id: string
        demand_GW: number
        gen_cap_store: MWGenCapStoreForH3R4
    }>(null)

    useEffect(() =>
    {
        if (!h3r4_id)
        {
            set_cell_info(null)
            return
        }

        return pub_sub.sub("power_gen_cap_store_and_demand", payload =>
        {
            const demand_GW = payload.demand_GW_by_h3r4[h3r4_id]?.demand_GW ?? 0
            const gen_cap_store = payload.gen_cap_store_MW_by_h3r4[h3r4_id] ?? EMPTY_GEN_CAP_STORE

            set_cell_info({
                h3r4_id,
                demand_GW,
                gen_cap_store,
            })
        }, "cell_info_panel", true)
    }, [h3r4_id])


    const gen_cap_els = cell_info ? POWER_TYPES.map(power_type =>
    {
        return { power_type, gen_cap: cell_info.gen_cap_store[power_type] }
    })
    .filter(({ gen_cap }) => gen_cap.capacity_MW > 0)
    .sort((a, b) => b.gen_cap.capacity_MW - a.gen_cap.capacity_MW)
    .map(({ power_type, gen_cap }) =>
    {
        return <div key={power_type}>
            {to_sentence_case(power_type)} {gen_cap.generated_MW.toFixed(0)} MW / {gen_cap.capacity_MW.toFixed(0)} MW
        </div>
    }) : []


    const [capacity_factor, set_capacity_factor] = useState(0)
    useEffect(() =>
    {
        if (!cell_info?.h3r4_id) return
        if (!map_capacity_factors_source) return

        const unsub_ref = { current: undefined as undefined | (() => void) }

        const show_hourly = map_capacity_factors_aggregation === "hourly"

        promise_load_all_capacity_factor_data().then(({ wind, annual_wind, solar, annual_solar}) =>
        {
            if (map_capacity_factors_source === "wind")
            {
                return show_hourly ? wind : annual_wind
            }
            else if (map_capacity_factors_source === "solar")
            {
                return show_hourly ? solar : annual_solar
            }
        })
        .then(data =>
        {
            if (!data) return

            if (show_hourly)
            {
                unsub_ref.current = pub_sub.sub("simulation_datetime", payload =>
                {
                    const datetime_index1 = payload.datetime_annual_hourly_index1
                    const datetime_index2 = payload.datetime_annual_hourly_index2
                    const datetime_index_mix = payload.datetime_annual_hourly_index_mix
                    const cell_id = cell_info.h3r4_id

                    const capacity_factor = get_capacity_factor_mix(data, datetime_index1, datetime_index2, datetime_index_mix, cell_id) ?? 0
                    set_capacity_factor(capacity_factor)
                })
            }
            else
            {
                const cell_id = cell_info.h3r4_id
                const capacity_factor = get_capacity_factor_mix(data, 1, 1, 1, cell_id) ?? 0
                set_capacity_factor(capacity_factor)
            }
        })

        return () =>
        {
            if (unsub_ref.current) unsub_ref.current()
        }
    }, [map_capacity_factors_source, cell_info])


    return <div
        id="tile_info_panel"
        className={"ui_info_box " + (h3r4_id ? "open" : "closed")}
    >
        <div className="ui_info_box_header" style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
                {/* Info */}
            </div>
            <CloseIcon
                style={{ height: 24, margin: "-5px -5px 0 0" }}
                on_click={() => set_cell_info_open(undefined)}
            />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {cell_info && <>

                {cell_info.demand_GW > 0 &&
                <div><b>Demand</b> {cell_info.demand_GW.toFixed(2)} GW</div>}

                {gen_cap_els.length === 0 && <div><b>No power plants</b></div>}

                {gen_cap_els.length > 0 && <>
                    <div><b>Generation by</b></div>
                    {gen_cap_els}
                </>}
            </>}

            {map_capacity_factors_source && <>
                <div><b>{to_sentence_case(map_capacity_factors_source + " capacity factor")}</b></div>
                <div>{Math.round(capacity_factor * 100).toFixed(0)}%</div>
            </>}

            {show_H3_cell_id && <span style={{
                fontSize: "var(--font-small)",
                color: COLOURS.text_muted,
                display: "flex",
                gap: 4,
            }}>
                {cell_info?.h3r4_id
                    ? <>
                        <div>
                            H3 cell ID: <span style={{ userSelect: "text" }}>{cell_info.h3r4_id}</span>
                        </div>
                        <div>
                            Area: <span style={{ userSelect: "text" }}>{cellArea(cell_info.h3r4_id, UNITS.km2).toFixed(0)} km²</span>
                        </div>
                    </>
                    : ""
                }
            </span>}
        </div>
    </div>
}


const EMPTY_GEN_CAP_STORE: MWGenCapStoreForH3R4 = {
    h3r4_id: "<empty>",
    total_generated_MW: 0,
    total_capacity_MW: 0,
    wind: { generated_MW: 0, capacity_MW: 0 },
    solar: { generated_MW: 0, capacity_MW: 0 },
    gas: { generated_MW: 0, capacity_MW: 0 },
    nuclear: { generated_MW: 0, capacity_MW: 0 },
    hydro_river: { generated_MW: 0, capacity_MW: 0 },
    battery: { generated_MW: 0, capacity_MW: 0 },
    hydro_pumped_storage: { generated_MW: 0, capacity_MW: 0 },
}

// function CellInfoText({ hovered_tile }: { hovered_tile: CellDataV1 | null })
// {
//     if (!hovered_tile) return <div>
//         {is_touch_screen() ? "Select" : "Hover over"} a tile<br/>
//         to see details
//     </div>

//     const { subtype, has_oil_rig } = hovered_tile
//     const info = land_or_sea_types[subtype]

//     return <div>
//         <div><b>Type:</b> {info.human_readable}</div>
//         {/* <div><b>Wind Turbine:</b> {hovered_tile.has_wind_turbine ? "Yes" : "No"}</div>
//         <div><b>Solar Farm:</b> {hovered_tile.has_solar_farm ? "Yes" : "No"}</div> */}
//         {has_oil_rig && <div><b>Oil Rig:</b> {has_oil_rig.state === "extracting" ? "Extracting" : "Dormant"}</div>}
//     </div>
// }
