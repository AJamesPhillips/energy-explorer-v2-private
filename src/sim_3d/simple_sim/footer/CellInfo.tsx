// import { useEffect, useRef, useState } from "react"

import { useEffect, useState } from "react"
import { CloseIcon } from "../../../components/svgs"
import { get_app_state } from "../../../state/store"
import pub_sub from "../../state/pub_sub"

// import { CloseIcon } from "../../../components/svgs"
// import { is_touch_screen } from "../../../utils/screen_type"
// import { land_or_sea_types } from "../../data/coverage_land/uk/data"
// import pub_sub from "../../state/pub_sub"
// import { CellDataV2, CellsData } from "../interface"
// import { RenderSingleTile } from "./RenderSingleTile"
import { to_sentence_case } from "../../../utils/string"
import { MWGenCapStoreForH3R4, POWER_TYPES } from "../../model/interface"
import "./CellInfo.css"



// const cells_data: CellsData<CellDataV2 & { human_readable: string }> = {}
// Object.values(land_or_sea_types).forEach((entry, i) =>
// {
//     const cell_data: CellDataV2 & { human_readable: string } = {
//         ...entry,
//         id: i,
//         x: i,
//         y: i,
//         has_wind_turbine: false,
//         has_solar_farm: false,
//         has_oil_rig: undefined,
//         has_oil_pocket: undefined,
//     }
//     cells_data[i] = { [i]: cell_data }
// })


export function CellInfo()
{
    const h3r4_id = get_app_state(state => state.view.h3r4_cell_info_open)
    const set_cell_info_open = get_app_state(state => state.view.set_h3r4_cell_info_open)

    const [cell_info, set_cell_info] = useState<null | {
        h3r4_id: string
        demand_GW: number
        gen_cap_store: MWGenCapStoreForH3R4
    }>(null)
//     const [hovered_tile, set_hovered_tile] = useState<CellDataV2 | null>(null)
//     const hovered_tile_ref = useRef<CellDataV2 | null>(null)
//     hovered_tile_ref.current = hovered_tile

//     useEffect(() => pub_sub.sub("on_hover_tile", set_hovered_tile), [])

//     useEffect(() => pub_sub.sub("will_update_tile", new_tile =>
//         {
//             const hovered_tile = hovered_tile_ref.current
//             if (!new_tile || !hovered_tile) return
//             if (new_tile.x !== hovered_tile.x || new_tile.y !== hovered_tile.y) return

//             set_hovered_tile(new_tile)
//         })
//     , [])

    useEffect(() =>
    {
        if (!h3r4_id)
        {
            set_cell_info(null)
            return
        }

        return pub_sub.sub("power_supply_and_demand", payload =>
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
                <div><b>Demand:</b> {cell_info.demand_GW.toFixed(2)} GW</div>}

                {gen_cap_els.length === 0 && <div><b>No power plants</b></div>}

                {gen_cap_els.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div><b>Generation by:</b></div>
                    {gen_cap_els}
                </div>}
            </>}
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
    hydro_RoR: { generated_MW: 0, capacity_MW: 0 },
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
