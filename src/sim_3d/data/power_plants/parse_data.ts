import { DataComponentExtended } from "../../../data/interface"
import { DataPoint } from "../interface"
import {
    BatteryPlant,
    GasPlant,
    HydroPlant,
    RawBatteryPlantData,
    RawGasPowerPlantData,
    RawHydroPowerPlantData,
    RawSolarFarmData,
    RawWindFarmData,
    SolarFarm,
    WindFarm,
} from "./interface"


const DEFAULT_OPERATIONAL_YEAR = 2020
export function parse_battery_data([lat, lon, installed_MW, storage_MWH]: RawBatteryPlantData): BatteryPlant
{
    return {
        type: "battery",
        operational_year: DEFAULT_OPERATIONAL_YEAR,
        nameplate_capacity_MW: installed_MW,
        storage_MWH,
        lon,
        lat,
    }
}

export function parse_gas_data([lat, lon, installed_MW]: RawGasPowerPlantData): GasPlant
{
    return {
        type: "gas",
        operational_year: DEFAULT_OPERATIONAL_YEAR,
        nameplate_capacity_MW: installed_MW,
        lon,
        lat,
    }
}

export function parse_hydro_data([lat, lon, installed_MW, storage_MWH]: RawHydroPowerPlantData): HydroPlant
{
    return {
        type: "hydro",
        operational_year: DEFAULT_OPERATIONAL_YEAR,
        nameplate_capacity_MW: installed_MW,
        storage_MWH,
        lon,
        lat,
    }
}

export function parse_solar_farm_data([_id, installed_MW, operational_year, lon, lat, area_m2, status]: RawSolarFarmData): SolarFarm
{
    return {
        type: "solar_farm",
        operational_year,
        status: status === "o" ? "operational" : "under_construction",
        area_km2: area_m2 / 1e6,
        nameplate_capacity_MW: installed_MW,
        lon,
        lat,
    }
}

interface SolarFarmDataRow
{
    net_area_km2: DataPoint
    cumulative_area_km2: DataPoint
}
export type SolarFarmsByYear = Record<number, SolarFarmDataRow>
export type SolarFields = (keyof SolarFarmDataRow)[]
export type SolarFarmsDataByYear<Fields extends string[]> = Record<number, {[f in Fields[number]]: DataPoint}>
export function process_solar_farms_data_component(component: DataComponentExtended): SolarFarmsByYear
{
    const { data } = JSON.parse(component.computed_value!) as { data: [number, Record<string, number>][] }
    const by_year: SolarFarmsByYear = {}

    data.forEach(row =>
    {
        const year = row[0]
        const total_area_km2 = row[1]["total area (km^2)"] ?? 0
        const cumulative_area_km2 = row[1]["total area (km^2) cumulative"] ?? 0

        const values: SolarFarmDataRow = {
            net_area_km2: { value: total_area_km2 },
            cumulative_area_km2: { value: cumulative_area_km2 },
        }

        by_year[year] = values
    })

    return by_year
}


export function parse_wind_farm_data([_id, installed_MW, operational_year, _turbine_mw, no_turbines, _turbine_heights_m, lon, lat, status]: RawWindFarmData): WindFarm
{
    return {
        type: "wind_farm",
        operational_year,
        status: status === "o" ? "operational" : "under_construction",
        area_km2: installed_MW / 4.2, // 4.2 MW per km² is a rough estimate from https://wikisim.org/wiki/1154
        number_of_turbines: no_turbines,
        nameplate_capacity_MW: installed_MW,
        lon,
        lat,
    }
}


interface WindFarmDataRow
{
    net_area_km2: DataPoint
    cumulative_area_km2: DataPoint
    onshore_net_area_km2: DataPoint
    onshore_cumulative_area_km2: DataPoint
    offshore_net_area_km2: DataPoint
    offshore_cumulative_area_km2: DataPoint
}
export type WindFarmsByYear = Record<number, WindFarmDataRow>
export type WindFields = (keyof WindFarmDataRow)[]
export type WindFarmsDataByYear<Fields extends string[]> = Record<number, {[f in Fields[number]]: DataPoint}>
export function process_wind_farms_data_component(component: DataComponentExtended): WindFarmsByYear
{
    const {
        onshore_data,
        offshore_data,
        all_data,
    } = JSON.parse(component.computed_value!) as { onshore_data: [number, Record<string, number>][], offshore_data: [number, Record<string, number>][], all_data: [number, Record<string, number>][] }

    const by_year: WindFarmsByYear = {}

    function process_row(row: [number, Record<string, number>], source: "onshore" | "offshore" | "all")
    {
        const year = row[0]
        const values: WindFarmDataRow = by_year[year] || {
            net_area_km2: { value: 0 },
            cumulative_area_km2: { value: 0 },
            onshore_net_area_km2: { value: 0 },
            onshore_cumulative_area_km2: { value: 0 },
            offshore_net_area_km2: { value: 0 },
            offshore_cumulative_area_km2: { value: 0 },
        }

        const total_area_km2 = row[1]["estimated_area_km2"] ?? 0
        const cumulative_area_km2 = row[1]["estimated_cumulative_area_km2"] ?? 0

        if (source === "onshore")
        {
            values.onshore_net_area_km2.value = total_area_km2
            values.onshore_cumulative_area_km2.value = cumulative_area_km2
        }
        else if (source === "offshore")
        {
            values.offshore_net_area_km2.value = total_area_km2
            values.offshore_cumulative_area_km2.value = cumulative_area_km2
        }
        else if (source === "all")
        {
            values.net_area_km2.value = total_area_km2
            values.cumulative_area_km2.value = cumulative_area_km2
        }

        by_year[year] = values
    }

    onshore_data.forEach(row => process_row(row, "onshore"))
    offshore_data.forEach(row => process_row(row, "offshore"))
    all_data.forEach(row => process_row(row, "all"))

    return by_year
}
