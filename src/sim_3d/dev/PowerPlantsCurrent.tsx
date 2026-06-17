import { useMemo } from "react"

import { WindTurbineFarms } from "../3d_models/WindTurbine"
import { aggregated_power_plants_by_h3_cell, power_plants_data } from "../data/power_plants"
import { SolarFarms } from "../simple_sim/tiles/SolarFarm"
import { AggregatedPowerPlantLayer } from "./AggregatedPowerPlantLayer"
import { get_projection, XY } from "./projection"



export function PowerPlantsCurrent({ show_aggregated }: { show_aggregated: boolean })
{
    if (show_aggregated) return <PowerPlantsCurrentAggregated />

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

        power_plants_data.forEach(p =>
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
        <WindTurbineFarms tiles={wind_farm_tiles} />
        <SolarFarms tiles={solar_farm_tiles} />
    </>
}


export function PowerPlantsCurrentAggregated()
{
    return <>
        <AggregatedPowerPlantLayer
            aggregated_data={aggregated_power_plants_by_h3_cell}
            plant_key="wind_farm"
            fill_color={0x1f6dff}
            outline_color={0x0f3fb2}
            opacity={0.45}
            min_area_ratio={0.04}
            RenderPlants={WindTurbineFarms}
        />
        <AggregatedPowerPlantLayer
            aggregated_data={aggregated_power_plants_by_h3_cell}
            plant_key="solar_farm"
            fill_color={0xf2b705}
            outline_color={0xc78b00}
            opacity={0.4}
            min_area_ratio={0.003}
            RenderPlants={SolarFarms}
        />
    </>
}
