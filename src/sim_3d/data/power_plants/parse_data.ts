import { RawSolarFarmData, RawWindFarmData, SolarFarm, WindFarm } from "./interface"


export function parse_wind_farm_data([_id, installed_mw, operational_year, _turbine_mw, no_turbines, _turbine_heights_m, lon, lat]: RawWindFarmData): WindFarm
{
    return {
        type: "wind_farm",
        operational_year,
        area_km2: installed_mw / 4.2, // 4.2 MW per km² is a rough estimate from https://wikisim.org/wiki/1154
        number_of_turbines: no_turbines,
        nameplate_capacity_mw: installed_mw,
        lon,
        lat,
    }
}


export function parse_solar_farm_data([_id, installed_mw, operational_year, lon, lat, area_m2]: RawSolarFarmData): SolarFarm
{
    return {
        type: "solar_farm",
        operational_year,
        area_km2: area_m2 / 1e6,
        nameplate_capacity_mw: installed_mw,
        lon,
        lat,
    }
}
