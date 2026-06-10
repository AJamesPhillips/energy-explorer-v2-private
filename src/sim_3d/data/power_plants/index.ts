import { latLngToCell } from "h3-js"

import { AggregatedPowerPlantData, PowerPlant } from "./interface"
import { parse_solar_farm_data, parse_wind_farm_data } from "./parse_data"
import { solar_farms } from "./solar_farm_data"
import { offshore_wind_farms, onshore_wind_farms } from "./wind_farm_data"



export const power_plants_data: PowerPlant[] = [
    ...offshore_wind_farms.map(parse_wind_farm_data),
    ...onshore_wind_farms.map(parse_wind_farm_data),
    ...solar_farms.map(parse_solar_farm_data),
]



export const H3_RESOLUTION = 4

function map_power_plants_by_h3_cell(plants: PowerPlant[]): Record<string, PowerPlant[]>
{
    const h3_cell_map: Record<string, PowerPlant[]> = {}

    plants.forEach(plant =>
    {
        const h3_index = latLngToCell(plant.lat, plant.lon, H3_RESOLUTION)

        h3_cell_map[h3_index] = h3_cell_map[h3_index] || []
        h3_cell_map[h3_index].push(plant)
    })

    return h3_cell_map
}


function aggregate_power_plants_by_h3_cell(plants_by_cell: Record<string, PowerPlant[]>): Record<string, AggregatedPowerPlantData>
{
    const aggregated: Record<string, AggregatedPowerPlantData> = {}

    for (const [h3_index, plants] of Object.entries(plants_by_cell))
    {
        const data: AggregatedPowerPlantData = {
            wind_farm:    { count: 0, capacity_mw: 0, area_km2: 0 },
            solar_farm:   { count: 0, capacity_mw: 0, area_km2: 0 },
            gas_plant:    { count: 0, capacity_mw: 0 },
            nuclear_plant: { count: 0, capacity_mw: 0 },
        }

        plants.forEach(plant =>
        {
            const capacity = plant.nameplate_capacity_mw

            if (plant.type === "wind_farm")
            {
                data.wind_farm.count++
                data.wind_farm.capacity_mw += capacity
                data.wind_farm.area_km2! += plant.area_km2
            }
            else if (plant.type === "solar_farm")
            {
                data.solar_farm.count++
                data.solar_farm.capacity_mw += capacity
                data.solar_farm.area_km2! += plant.area_km2
            }
            else if (plant.type === "gas")
            {
                data.gas_plant.count++
                data.gas_plant.capacity_mw += capacity
            }
            else if (plant.type === "nuclear")
            {
                data.nuclear_plant.count++
                data.nuclear_plant.capacity_mw += capacity
            }
        })

        aggregated[h3_index] = data
    }

    return aggregated
}


export const power_plants_by_h3_cell = map_power_plants_by_h3_cell(power_plants_data)

export const aggregated_power_plants_by_h3_cell = aggregate_power_plants_by_h3_cell(power_plants_by_h3_cell)
