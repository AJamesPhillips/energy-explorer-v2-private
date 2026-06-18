import { Box } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"

import { SolarFarms } from "../../3d_models/SolarFarm"
import { WindTurbineFarms } from "../../3d_models/WindTurbine"
import { CONSTANTS, DEFAULTS } from "../constants"
import { CellDataV1 } from "../interface"
import { IsoCamera } from "../IsoCamera"
import { bevel_colours, box_geometry_for_cell_size } from "../IsoMetricTileConstants"
import { tile_colour } from "../tile"
import { OilRigTiles } from "../tiles/OilRig"
import { SuburbanTiles } from "../tiles/Suburban"
import { UrbanTiles } from "../tiles/Urban"
import { Woodland } from "../tiles/Woodland"
import "./TileInfo.css"


const { CELL_SIZE } = CONSTANTS
const { sun_args } = DEFAULTS

const { box_geo_s, box_geo_h } = box_geometry_for_cell_size(CELL_SIZE)

// function Mock3dTile(props: { colour: string })
// {
//     return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//         {/* Diamond */}
//         <polygon points="10,6 20,13 10,20 0,13" fill={props.colour} />
//     </svg>
// }

interface RenderSingleTileProps
{
    tile_data: CellDataV1 | null
    size?: number
    border?: string
}
export function RenderSingleTile({ tile_data, size, border }: RenderSingleTileProps)
{
    size = size ?? 70
    border = border ?? "1px solid lightgrey"

    return <div style={{ width: size, height: size, border }}>
        <Canvas>
            <IsoCamera grid_size={{ x: 1, y: 1 }} cell_size={CELL_SIZE} />
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
                <WindTurbineFarms tiles={[{ x: 0, y: 0 }]} cell_size={CELL_SIZE} />
            </>}
            {tile_data?.has_solar_farm && <>
                <SolarFarms tiles={[{ x: 0, y: 0 }]} cell_size={CELL_SIZE} />
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
