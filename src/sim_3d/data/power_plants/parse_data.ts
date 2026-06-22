import { BatteryPlant, GasPlant, HydroPlant, RawBatteryPlantData, RawGasPowerPlantData, RawHydroPowerPlantData, RawSolarFarmData, RawWindFarmData, SolarFarm, WindFarm } from "./interface"


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

export function parse_solar_farm_data([_id, installed_MW, operational_year, lon, lat, area_m2]: RawSolarFarmData): SolarFarm
{
    return {
        type: "solar_farm",
        operational_year,
        area_km2: area_m2 / 1e6,
        nameplate_capacity_MW: installed_MW,
        lon,
        lat,
    }
}

export function parse_wind_farm_data([_id, installed_MW, operational_year, _turbine_mw, no_turbines, _turbine_heights_m, lon, lat]: RawWindFarmData): WindFarm
{
    return {
        type: "wind_farm",
        operational_year,
        area_km2: installed_MW / 4.2, // 4.2 MW per km² is a rough estimate from https://wikisim.org/wiki/1154
        number_of_turbines: no_turbines,
        nameplate_capacity_MW: installed_MW,
        lon,
        lat,
    }
}
