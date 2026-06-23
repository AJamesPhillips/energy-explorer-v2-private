import { cellToLatLng, latLngToCell } from "h3-js"

import { get_projection, latlon_tuple_to_obj } from "../../dev/projection"
import { CapacityFactorData } from "../../utils/capacity_factor_data"
import { battery_plants_data } from "./battery_plants_data"
import { gas_plants_data } from "./gas_plant_data"
import { hydro_plants_data } from "./hydro_plant_data"
import { AggregatedPowerPlantData, PowerPlant } from "./interface"
import { nuclear_plants } from "./nuclear_plants_data"
import {
    parse_battery_data,
    parse_gas_data,
    parse_hydro_data,
    parse_solar_farm_data,
    parse_wind_farm_data,
} from "./parse_data"
import { solar_farms } from "./solar_farm_data"
import { offshore_wind_farms, onshore_wind_farms } from "./wind_farm_data"



export const initial_power_plants_data: PowerPlant[] = [
    ...offshore_wind_farms.map(parse_wind_farm_data),
    ...onshore_wind_farms.map(parse_wind_farm_data),
    ...solar_farms.map(parse_solar_farm_data),
    ...nuclear_plants,
    ...battery_plants_data.map(parse_battery_data),
    ...hydro_plants_data.map(parse_hydro_data),
    ...gas_plants_data.map(parse_gas_data),
]



export const H3_RESOLUTION = 4

export function map_power_plants_by_h3_cell(plants: PowerPlant[]): Record<string, PowerPlant[]>
{
    const h3_cell_map: Record<string, PowerPlant[]> = {}

    plants.forEach(plant =>
    {
        const h3_id = latLngToCell(plant.lat, plant.lon, H3_RESOLUTION)

        h3_cell_map[h3_id] = h3_cell_map[h3_id] || []
        h3_cell_map[h3_id].push(plant)
    })

    return h3_cell_map
}


export function empty_aggregated_power_plant_data(
    h3r4_id: string,
    wind_capacity_factor: CapacityFactorData,
    solar_pv_capacity_factor: CapacityFactorData,
): AggregatedPowerPlantData
{
    const lat_lon = latlon_tuple_to_obj(cellToLatLng(h3r4_id))
    const projection = get_projection()
    const xy = projection(lat_lon)
    if (!xy) throw new Error(`Failed to project lat/lon for h3_id ${h3r4_id}`)

    const h3_index_wind = wind_capacity_factor.h3_cell_id_to_index.get(h3r4_id)
    if (h3_index_wind === undefined) throw new Error(`H3 cell ID ${h3r4_id} not found in wind capacity factor data`)
    const h3_index_solar = solar_pv_capacity_factor.h3_cell_id_to_index.get(h3r4_id)

    const data: AggregatedPowerPlantData = {
        wind:     { h3_id: h3r4_id, lat_lon, xy, count: 0, starting_capacity_MW: 0, capacity_MW: 0, starting_area_km2: 0, area_km2: 0, h3_capacity_factor_index: h3_index_wind },
        solar:    { h3_id: h3r4_id, lat_lon, xy, count: 0, starting_capacity_MW: 0, capacity_MW: 0, starting_area_km2: 0, area_km2: 0, h3_capacity_factor_index: h3_index_solar },
        gas:     { h3_id: h3r4_id, lat_lon, xy, count: 0, starting_capacity_MW: 0, capacity_MW: 0 },
        nuclear: { h3_id: h3r4_id, lat_lon, xy, count: 0, starting_capacity_MW: 0, capacity_MW: 0 },
        battery: { h3_id: h3r4_id, lat_lon, xy, count: 0, starting_capacity_MW: 0, capacity_MW: 0, storage_MWH: 0 },
        hydro_pumped_storage: { h3_id: h3r4_id, lat_lon, xy, count: 0, starting_capacity_MW: 0, capacity_MW: 0, storage_MWH: 0 },
        hydro_river: { h3_id: h3r4_id, lat_lon, xy, count: 0, starting_capacity_MW: 0, capacity_MW: 0 },
    }

    return data
}


export function aggregate_power_plants_by_h3_cell(
    plants_by_cell: Record<string, PowerPlant[]>,
    wind_capacity_factor: CapacityFactorData,
    solar_pv_capacity_factor: CapacityFactorData,
): Record<string, AggregatedPowerPlantData>
{
    const aggregated: Record<string, AggregatedPowerPlantData> = {}

    for (const [h3r4_id, plants] of Object.entries(plants_by_cell))
    {
        const data = empty_aggregated_power_plant_data(h3r4_id, wind_capacity_factor, solar_pv_capacity_factor)

        const active_plants = get_active_power_plants(plants, 2026)

        active_plants.forEach(plant =>
        {
            const capacity = plant.nameplate_capacity_MW

            if (plant.type === "wind_farm")
            {
                data.wind.count++
                data.wind.starting_capacity_MW += capacity
                data.wind.capacity_MW += capacity
                data.wind.starting_area_km2! += plant.area_km2
                data.wind.area_km2! += plant.area_km2
            }
            else if (plant.type === "solar_farm")
            {
                data.solar.count++
                data.solar.starting_capacity_MW += capacity
                data.solar.capacity_MW += capacity
                data.solar.starting_area_km2! += plant.area_km2
                data.solar.area_km2! += plant.area_km2
            }
            else if (plant.type === "gas")
            {
                data.gas.count++
                data.gas.starting_capacity_MW += capacity
                data.gas.capacity_MW += capacity
            }
            else if (plant.type === "nuclear")
            {
                data.nuclear.count++
                data.nuclear.starting_capacity_MW += capacity
                data.nuclear.capacity_MW += capacity
            }
            else if (plant.type === "battery")
            {
                data.battery.count++
                data.battery.starting_capacity_MW += capacity
                data.battery.capacity_MW += capacity
                data.battery.storage_MWH! += plant.storage_MWH
            }
            else if (plant.type === "hydro")
            {
                if (plant.storage_MWH && plant.storage_MWH > 0)
                {
                    data.hydro_pumped_storage.count++
                    data.hydro_pumped_storage.starting_capacity_MW += capacity
                    data.hydro_pumped_storage.capacity_MW += capacity
                    data.hydro_pumped_storage.storage_MWH! += plant.storage_MWH
                }
                else
                {
                    data.hydro_river.count++
                    data.hydro_river.starting_capacity_MW += capacity
                    data.hydro_river.capacity_MW += capacity
                }
            }
            // @ts-expect-error
            else console.error(`Unknown plant type: ${plant.type}`)
        })

        aggregated[h3r4_id] = data
    }

    return aggregated
}


function get_active_power_plants(power_plants: PowerPlant[], year: number): PowerPlant[]
{
    return power_plants.filter(plant =>
        plant.operational_year &&
        plant.operational_year <= year &&
        (plant.decommissioned_year === undefined || plant.decommissioned_year > year)
    )
}


export const initial_power_plants_by_h3_cell = map_power_plants_by_h3_cell(initial_power_plants_data)
