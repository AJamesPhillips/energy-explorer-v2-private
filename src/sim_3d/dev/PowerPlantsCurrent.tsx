import { latLngToCell } from "h3-js"
import { useMemo } from "react"

import { get_app_state } from "../../state/store"
import { NuclearPlants } from "../3d_models/NuclearPlant"
import { SolarFarms } from "../3d_models/SolarFarm"
import { WindTurbineFarms } from "../3d_models/WindTurbine"
import { initial_power_plants_data } from "../data/power_plants"
import { AggregatedPowerPlantLayer } from "./AggregatedPowerPlantLayer"
import { get_projection, XY } from "./projection"



export function PowerPlantsCurrent({ show_aggregated }: { show_aggregated: boolean })
{
    if (show_aggregated) return <PowerPlantsCurrentAggregated />

    const power_plants_data = initial_power_plants_data // get_app_state(state => state.power_plants.all)

    const {
        wind_farm_tiles,
        solar_farm_tiles,
        // gas_plant_tiles,
        nuclear_plant_tiles,
    } = useMemo(() =>
    {
        const projection = get_projection()

        const wind_farm_tiles: (XY & { h3r4_id: string })[] = []
        const solar_farm_tiles: (XY & { h3r4_id: string })[] = []
        const gas_plant_tiles: (XY & { h3r4_id: string })[] = []
        const nuclear_plant_tiles: (XY & { h3r4_id: string })[] = []

        power_plants_data.forEach(p =>
        {
            const h3r4_id = latLngToCell(p.lat, p.lon, 4)
            const xy = projection(p)
            if (!xy) return
            if (p.type === "wind_farm") wind_farm_tiles.push({ ...xy, h3r4_id })
            else if (p.type === "solar_farm") solar_farm_tiles.push({ ...xy, h3r4_id })
            else if (p.type === "gas") gas_plant_tiles.push({ ...xy, h3r4_id })
            else if (p.type === "nuclear") nuclear_plant_tiles.push({ ...xy, h3r4_id })
        })

        return { wind_farm_tiles, solar_farm_tiles, gas_plant_tiles, nuclear_plant_tiles }
    }, [power_plants_data])

    return <>
        <WindTurbineFarms tiles={wind_farm_tiles} />
        <SolarFarms tiles={solar_farm_tiles} />
        <NuclearPlants tiles={nuclear_plant_tiles} />
    </>
}


export function PowerPlantsCurrentAggregated()
{
    const aggregated_power_plants_by_h3r4_cell = get_app_state(state => state.power_plants.aggregated_by_h3r4)

    if (!aggregated_power_plants_by_h3r4_cell) return null

    return <>
        <AggregatedPowerPlantLayer
            aggregated_data={aggregated_power_plants_by_h3r4_cell}
            plant_key="wind"
            fill_color={0x1f6dff}
            outline_color={0x0f3fb2}
            opacity={0.45}
            min_area_ratio={0.04}
            RenderPlants={WindTurbineFarms}
        />
        <AggregatedPowerPlantLayer
            aggregated_data={aggregated_power_plants_by_h3r4_cell}
            plant_key="solar"
            fill_color={0xf2b705}
            outline_color={0xc78b00}
            opacity={0.4}
            min_area_ratio={0.003}
            RenderPlants={SolarFarms}
        />
        <AggregatedPowerPlantLayer
            aggregated_data={aggregated_power_plants_by_h3r4_cell}
            plant_key="nuclear"
            fill_color={0xf2b705}
            outline_color={0xc78b00}
            opacity={0.4}
            min_area_ratio={undefined}
            RenderPlants={NuclearPlants}
        />
    </>
}
