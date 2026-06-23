import { OilGasByYear } from "../../sim_3d/data/fossil_fuels/process_data_component"
import { PopulationByYear } from "../../sim_3d/data/population/process_data_component"
import { SolarFarmsByYear } from "../../sim_3d/data/solar_pv_farms/process_data_component"
import { WindFarmsByYear } from "../../sim_3d/data/wind_farms/process_data_component"


export interface DataBlob1
{
    oil_gas_by_year?: OilGasByYear
    population_by_year?: PopulationByYear
    solar_farms_by_year?: SolarFarmsByYear
    wind_farms_by_year?: WindFarmsByYear
}

export interface DataState
{
    oil_gas_by_year: OilGasByYear | undefined
    population_by_year: PopulationByYear | undefined
    solar_farms_by_year: SolarFarmsByYear | undefined
    wind_farms_by_year: WindFarmsByYear | undefined
    set_data: (data: DataBlob1) => void
    set_oil_gas_by_year: (oil_gas_by_year: OilGasByYear) => void
    set_population_by_year: (population_by_year: PopulationByYear) => void
    set_solar_farms_by_year: (solar_farms_by_year: SolarFarmsByYear) => void
    set_wind_farms_by_year: (wind_farms_by_year: WindFarmsByYear) => void

    population: number | undefined
    set_population: (population: number) => void
}
