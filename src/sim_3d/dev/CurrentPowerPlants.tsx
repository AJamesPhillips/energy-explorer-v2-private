import { useMemo } from "react"

import { WindTurbineFarms } from "../3d_models/WindTurbine"
import { PowerPlant } from "../data/power_plants/interface"
import { parse_solar_farm_data, parse_wind_farm_data } from "../data/power_plants/parse_data"
import { solar_farms } from "../data/power_plants/solar_farm_data"
import { offshore_wind_farms, onshore_wind_farms } from "../data/power_plants/wind_farm_data"
import { SolarFarms } from "../simple_sim/tiles/SolarFarm"
import { get_projection, XY } from "./projection"


const data: PowerPlant[] = [
    ...offshore_wind_farms.map(parse_wind_farm_data),
    ...onshore_wind_farms.map(parse_wind_farm_data),
    ...solar_farms.map(parse_solar_farm_data),
]

export function CurrentPowerPlants()
{
    const projection = get_projection()

    const {
        wind_farm_tiles,
        solar_farm_tiles,
        gas_plant_tiles,
        nuclear_plant_tiles,
    } = useMemo(() =>
    {
        const wind_farm_tiles: XY[] = []
        const solar_farm_tiles: XY[] = []
        const gas_plant_tiles: XY[] = []
        const nuclear_plant_tiles: XY[] = []

        data.forEach(p =>
        {
            const xy = projection(p)
            if (!xy) return
            if (p.type === "wind_farm") wind_farm_tiles.push(xy)
            else if (p.type === "solar_farm") solar_farm_tiles.push(xy)
            else if (p.type === "gas") gas_plant_tiles.push(xy)
            else if (p.type === "nuclear") nuclear_plant_tiles.push(xy)
        })


        return { wind_farm_tiles, solar_farm_tiles, gas_plant_tiles, nuclear_plant_tiles }
    }, [])

    return <>
        <WindTurbineFarms tiles={wind_farm_tiles} size={12} />
        <SolarFarms tiles={solar_farm_tiles} size={2} />
    </>
}
