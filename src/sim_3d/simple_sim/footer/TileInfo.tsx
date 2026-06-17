// import { useEffect, useRef, useState } from "react"

// import { CloseIcon } from "../../../components/svgs"
// import { is_touch_screen } from "../../../utils/screen_type"
// import { land_or_sea_types } from "../../data/coverage_land/uk/data"
// import pub_sub from "../../state/pub_sub"
// import { CellDataV2, CellsData } from "../interface"
// import { RenderSingleTile } from "./RenderSingleTile"
// import "./TileInfo.css"



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


// export function TileInfo()
// {
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

//     return <div id="tile_info_panel" className="ui_info_box">
//         <div className="ui_info_box_header" style={{ display: "flex", justifyContent: "space-between" }}>
//             <div>Tile Info</div>
//             {false && <CloseIcon
//                 style={{ height: 24, margin: "-5px -5px 0 0" }}
//             />}
//         </div>

//         {/* {Object.keys(land_or_sea_types).map(at =>
//         {
//             const area_type = at as LandOrSeaType

//             const class_name = "visual_key_item " + area_type
//             return <div key={area_type} className={class_name}>
//                 <Mock3dTile colour={tile_colour(area_type)} />{area_type_to_human_readable(area_type)}
//             </div>
//         })} */}
//         <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, minWidth: 235 }}>
//             <RenderSingleTile tile_data={hovered_tile} />
//             <TileInfoText hovered_tile={hovered_tile} />
//         </div>
//     </div>
// }


// function TileInfoText({ hovered_tile }: { hovered_tile: CellDataV1 | null })
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
