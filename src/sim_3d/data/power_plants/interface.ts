

export type RawWindFarmData = [number, number, number | undefined, number | undefined, number, undefined | number, number, number]
export type RawSolarFarmData = [number, number, number | undefined, number, number, number]


interface PowerPlantBase
{
    lat: number
    lon: number
    nameplate_capacity_mw: number
    operational_year: number | undefined
    name?: string
}
export interface WindFarm extends PowerPlantBase
{
    type: "wind_farm"
    area_km2: number
    number_of_turbines: number
}
export interface SolarFarm extends PowerPlantBase
{
    type: "solar_farm"
    area_km2: number
}
export interface GasPlant extends PowerPlantBase
{
    type: "gas"
}
export interface NuclearPlant extends PowerPlantBase
{
    type: "nuclear"
}

export type PowerPlant = WindFarm | SolarFarm | GasPlant | NuclearPlant
