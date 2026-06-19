import { useMemo } from "react"

import { OilAndGasPocketTiles } from "../3d_models/OilAndGasPocket"
import { OilRigTiles } from "../3d_models/OilRig"
import { SolarFarms } from "../3d_models/SolarFarm"
import { SuburbanTiles } from "../3d_models/Suburban"
import { UrbanTiles } from "../3d_models/Urban"
import { WindTurbineFarms } from "../3d_models/WindTurbine"
import { Woodland } from "../3d_models/Woodland"
import { CellDataV1 } from "./interface"


interface IsoMetricGridContentTilesProps
{
    cell_size: number
    tiles: CellDataV1[]
}

export function IsoMetricGridContentTiles(props: IsoMetricGridContentTilesProps)
{
    const { cell_size, tiles } = props
    const size = cell_size

    const woodland_tiles = useMemo(
        () => tiles.filter(cell => cell.type === "land" && cell.subtype === "woodland"),
        [tiles],
    )

    const urban_tiles = useMemo(
        () => tiles.filter(cell => cell.type === "land" && cell.subtype === "urban"),
        [tiles],
    )

    const suburban_tiles = useMemo(
        () => tiles.filter(cell => cell.type === "land" && cell.subtype === "suburban"),
        [tiles],
    )

    const wind_turbine_tiles = useMemo(
        () => tiles.filter(cell => cell.has_wind_turbine),
        [tiles],
    )

    const solar_farm_tiles = useMemo(
        () => tiles.filter(cell => cell.has_solar_farm),
        [tiles],
    )

    const oil_rig_tiles = useMemo(
        () => tiles.filter(cell => cell.has_oil_rig),
        [tiles],
    )

    const oil_and_gas_pocket_tiles = useMemo(
        () => tiles.filter(cell => cell.has_oil_pocket)
            .map(cell => ({
                x: cell.x,
                y: cell.y,
                depth: 2.0,
                ratio_remaining: cell.has_oil_pocket!.ratio_remaining,
            })),
        [tiles],
    )

    return <>
        <Woodland tiles={woodland_tiles} size={size} />
        <SuburbanTiles tiles={suburban_tiles} size={size} />
        <UrbanTiles tiles={urban_tiles} size={size} />

        <WindTurbineFarms tiles={wind_turbine_tiles} size={size} />
        <SolarFarms tiles={solar_farm_tiles} size={size} />

        <OilRigTiles tiles={oil_rig_tiles} cell_size={cell_size} />
        <OilAndGasPocketTiles tiles={oil_and_gas_pocket_tiles} cell_size={cell_size} />
    </>
}
