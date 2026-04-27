
import { Box } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"

import { LandOrSea, LandOrSeaType } from "../data/land_coverage/uk/data"
import pub_sub from "../state/pub_sub"
import { CONSTANTS, DEFAULTS } from "./constants"
import { CellData, CellsData } from "./interface"
import { IsoCamera } from "./IsoCamera"
import { bevel_colours, box_geometry_for_cell_size } from "./IsoMetricTileConstants"
import { tile_colour } from "./tile"
import { OilRigTiles } from "./tiles/OilRig"
import { SolarFarm } from "./tiles/SolarFarm"
import { SuburbanTiles } from "./tiles/Suburban"
import { UrbanTiles } from "./tiles/Urban"
import { WindTurbine } from "./tiles/WindTurbine"
import { Woodland } from "./tiles/Woodland"
import "./VisualKey.css"


const { CELL_SIZE } = CONSTANTS
const { sun_args } = DEFAULTS

const { box_geo_s, box_geo_h } = box_geometry_for_cell_size(CELL_SIZE)


const land_or_sea_types: Record<LandOrSeaType, LandOrSea & { human_readable: string }> = {
    woodland:     { type: "land", subtype: "woodland",     human_readable: "Woodland" },
    arable:       { type: "land", subtype: "arable",       human_readable: "Arable" },
    grassland:    { type: "land", subtype: "grassland",    human_readable: "Grassland" },
    suburban:     { type: "land", subtype: "suburban",     human_readable: "Suburban" },
    urban:        { type: "land", subtype: "urban",        human_readable: "Urban" },
    rock:         { type: "land", subtype: "rock",         human_readable: "Rock" },
    wetland:      { type: "land", subtype: "wetland",      human_readable: "Wetland" },
    inland_water: { type: "land", subtype: "inland_water", human_readable: "Inland Water" },

    shallow: { type: "sea", subtype: "shallow", human_readable: "Shallow Sea" },
    deep:    { type: "sea", subtype: "deep",    human_readable: "Deep Sea" },
}

const cells_data: CellsData<CellData & { human_readable: string }> = {}
Object.values(land_or_sea_types).forEach((entry, i) =>
{
    const cell_data: CellData & { human_readable: string } = {
        ...entry,
        id: i,
        x: i,
        y: i,
        has_wind_turbine: false,
        has_solar_farm: false,
        has_oil_rig: undefined,
        has_oil_pocket: undefined,
    }
    cells_data[i] = { [i]: cell_data }
})


export function VisualKey()
{
    const [hovered_tile, set_hovered_tile] = useState<CellData | null>(null)
    const hovered_tile_ref = useRef<CellData | null>(null)
    hovered_tile_ref.current = hovered_tile

    useEffect(() => pub_sub.sub("on_hover_tile", set_hovered_tile), [])

    useEffect(() => pub_sub.sub("will_update_tile", new_tile =>
        {
            const hovered_tile = hovered_tile_ref.current
            if (!new_tile || !hovered_tile) return
            if (new_tile.x !== hovered_tile.x || new_tile.y !== hovered_tile.y) return

            set_hovered_tile(new_tile)
        })
    , [])



    return <div id="visual_key" className="ui_info_box">
        <div className="ui_info_box_header">
            Tile Info
        </div>

        {/* {Object.keys(land_or_sea_types).map(at =>
        {
            const area_type = at as LandOrSeaType

            const class_name = "visual_key_item " + area_type
            return <div key={area_type} className={class_name}>
                <Mock3dTile colour={tile_colour(area_type)} />{area_type_to_human_readable(area_type)}
            </div>
        })} */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, minWidth: 235 }}>
            <RenderTileView tile_data={hovered_tile} />
            <TileInfoText hovered_tile={hovered_tile} />
        </div>
    </div>
}

// function area_type_to_human_readable(area_type: string): string
// {
//     area_type = area_type.split("_").map(word =>
//     {
//         const [first, ...rest] = word.split("")
//         if (!first) return word
//         return first.toUpperCase() + rest.join("")
//     }).join(" ")
//     return area_type
// }



// function Mock3dTile(props: { colour: string })
// {
//     return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//         {/* Diamond */}
//         <polygon points="10,6 20,13 10,20 0,13" fill={props.colour} />
//     </svg>
// }


function RenderTileView({ tile_data }: { tile_data: CellData | null })
{
    return <div style={{ width: 70, height: 70, border: "1px solid lightgrey" }}>
        <Canvas>
            <IsoCamera grid_size={{ x: 1, y: 1 }} cell_size={CELL_SIZE} position_xy={{ x: 1.5, y: 1.5 }} />
            <ambientLight
                color={sun_args.colour}
                intensity={sun_args.ambient_intensity}
            />
            <directionalLight
                position={sun_args.direct_position}
                color={sun_args.colour}
                intensity={sun_args.direct_intensity}
            />

            {/* <Box args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]} position={[0, 0, 0]}>
                <meshStandardMaterial color={"blue"} />
            </Box> */}
            <Box args={[box_geo_s, box_geo_h, box_geo_s]} position={[0, 0, 0]}>
                <meshStandardMaterial color={tile_colour(tile_data?.subtype)} />
                <bufferAttribute attach="attributes-color" args={[bevel_colours, 3]} />
            </Box>

            {tile_data?.subtype === "woodland" && <>
                <Woodland tiles={[{ x: 0, y: 0, id: tile_data.id }]} cell_size={CELL_SIZE} />
            </>}
            {tile_data?.subtype === "urban" && <>
                <UrbanTiles tiles={[{ x: 0, y: 0, id: tile_data.id }]} cell_size={CELL_SIZE} />
            </>}
            {tile_data?.subtype === "suburban" && <>
                <SuburbanTiles tiles={[{ x: 0, y: 0, id: tile_data.id }]} cell_size={CELL_SIZE} />
            </>}
            {tile_data?.has_wind_turbine && <>
                <WindTurbine tiles={[{ x: 0, y: 0 }]} cell_size={CELL_SIZE} />
            </>}
            {tile_data?.has_solar_farm && <>
                <SolarFarm tiles={[{ x: 0, y: 0 }]} cell_size={CELL_SIZE} />
            </>}
            {tile_data?.has_oil_rig && <>
                <OilRigTiles
                    tiles={[{ x: 0, y: 0, has_oil_rig: tile_data.has_oil_rig }]}
                    cell_size={CELL_SIZE}
                />
            </>}
            {/* <IsoMetricGrid size={GRID_SIZE} cell_size={CELL_SIZE} data={cells_data} /> */}
        </Canvas>
    </div>
}


function TileInfoText({ hovered_tile }: { hovered_tile: CellData | null })
{
    if (!hovered_tile) return <div>
        Hover over a tile<br/>
        to see details
    </div>

    const { subtype, has_oil_rig } = hovered_tile
    const info = land_or_sea_types[subtype]

    return <div>
        <div><b>Type:</b> {info.human_readable}</div>
        {/* <div><b>Wind Turbine:</b> {hovered_tile.has_wind_turbine ? "Yes" : "No"}</div>
        <div><b>Solar Farm:</b> {hovered_tile.has_solar_farm ? "Yes" : "No"}</div> */}
        {has_oil_rig && <div><b>Oil Rig:</b> {has_oil_rig.state === "extracting" ? "Extracting" : "Dormant"}</div>}
    </div>
}
