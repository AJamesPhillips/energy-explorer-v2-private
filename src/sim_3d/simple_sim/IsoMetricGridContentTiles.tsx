import { useMemo } from "react"
import { CellData } from "./interface"
import { OilAndGasPocketTiles } from "./tiles/OilAndGasPocket"
import { OilRigTiles } from "./tiles/OilRig"
import { SolarFarms } from "./tiles/SolarFarm"
import { SuburbanTiles } from "./tiles/Suburban"
import { UrbanTiles } from "./tiles/Urban"
import { WindTurbineFarms } from "./tiles/WindTurbine"
import { Woodland } from "./tiles/Woodland"


interface IsoMetricGridContentTilesProps
{
    cell_size: number
    tiles: CellData[]
}

export function IsoMetricGridContentTiles(props: IsoMetricGridContentTilesProps)
{
    const { cell_size, tiles } = props

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
        <Woodland tiles={woodland_tiles} cell_size={cell_size} />
        <SuburbanTiles tiles={suburban_tiles} cell_size={cell_size} />
        <UrbanTiles tiles={urban_tiles} cell_size={cell_size} />

        <WindTurbineFarms tiles={wind_turbine_tiles} cell_size={cell_size} />
        <SolarFarms tiles={solar_farm_tiles} cell_size={cell_size} />

        <OilRigTiles tiles={oil_rig_tiles} cell_size={cell_size} />
        <OilAndGasPocketTiles tiles={oil_and_gas_pocket_tiles} cell_size={cell_size} />
    </>
}
