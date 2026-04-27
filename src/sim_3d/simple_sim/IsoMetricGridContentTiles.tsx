import { useMemo } from "react"
import { CellData } from "./interface"
import { OilAndGasPocketTiles } from "./tiles/OilAndGasPocket"
import { OilRigTiles } from "./tiles/OilRig"
import { SolarFarm } from "./tiles/SolarFarm"
import { SuburbanTiles } from "./tiles/Suburban"
import { UrbanTiles } from "./tiles/Urban"
import { WindTurbine } from "./tiles/WindTurbine"
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
        () => tiles.filter(cell => cell.has_oil_rig || cell.has_oil_pocket)
            .map(cell => ({
                x: cell.x,
                y: cell.y,
                ratio_remaining: !cell.has_oil_rig ? 1 : cell.has_oil_rig.state === "extracting" ? 0.5 : 0,
            })),
        [tiles],
    )

    return <>
        <Woodland tiles={woodland_tiles} cell_size={cell_size} />
        <SuburbanTiles tiles={suburban_tiles} cell_size={cell_size} />
        <UrbanTiles tiles={urban_tiles} cell_size={cell_size} />

        <WindTurbine tiles={wind_turbine_tiles} cell_size={cell_size} />
        <SolarFarm tiles={solar_farm_tiles} cell_size={cell_size} />

        <OilRigTiles tiles={oil_rig_tiles} cell_size={cell_size} />
        <OilAndGasPocketTiles tiles={oil_and_gas_pocket_tiles} cell_size={cell_size} />
    </>
}
