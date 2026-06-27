import type { ILatLon } from "core/data/values/LatLon"

import type { XY } from "../../dev/projection"
import { ValueByPowerType } from "../../model/interface"


export type RawBatteryPlantData = [number, number, number, number]
export type RawGasPowerPlantData = [number, number, number]
export type RawHydroPowerPlantData = [number, number, number, number | undefined]
export type RawSolarFarmData = [number, number, number | undefined, number, number, number, "o" | "uc"]
export type RawWindFarmData = [number, number, number | undefined, number | undefined, number, undefined | number, number, number, "o" | "uc"]


interface PowerPlantBase
{
    lat: number
    lon: number
    nameplate_capacity_MW: number
    storage_MWH?: number
    // When was it commissioned
    operational_year: number | undefined
    status?: "operational" | "under_construction"
    decommissioned_year?: number
    name?: string
}
export interface BatteryPlant extends PowerPlantBase
{
    type: "battery"
    storage_MWH: number
}
export interface GasPlant extends PowerPlantBase
{
    type: "gas"
}
export interface HydroPlant extends PowerPlantBase
{
    type: "hydro"
}
export interface NuclearPlant extends PowerPlantBase
{
    type: "nuclear"
}
export interface SolarFarm extends PowerPlantBase
{
    type: "solar_farm"
    area_km2: number
}
export interface WindFarm extends PowerPlantBase
{
    type: "wind_farm"
    area_km2: number
    number_of_turbines: number
}

export type PowerPlant = BatteryPlant | GasPlant | HydroPlant | NuclearPlant | SolarFarm | WindFarm


export interface AggregatePowerPlantData
{
    h3_id: string
    h3_capacity_factor_index?: number
    lat_lon: ILatLon
    xy: XY
    starting_count: number
    count: number
    starting_capacity_MW: number
    capacity_MW: number
    storage_MWH?: number
    starting_area_km2?: number
    area_km2?: number
}
export type AggregatedPowerPlantData = ValueByPowerType<AggregatePowerPlantData>
//  & {
// {
//     wind_farm: AggregatePowerPlantData
//     solar_farm: AggregatePowerPlantData
//     gas_plant: AggregatePowerPlantData
//     nuclear_plant: AggregatePowerPlantData
//     battery_plant: AggregatePowerPlantData
//     hydro_pumped_plant: AggregatePowerPlantData
//     // Run of river hydro plants (no storage)
//     hydro_river_plant: AggregatePowerPlantData
// }
