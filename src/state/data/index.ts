
import { OilGasByYear } from "../../sim_3d/data/fossil_fuels/process_data_component"
import { PopulationByYear } from "../../sim_3d/data/population/process_data_component"
import { SolarFarmsByYear } from "../../sim_3d/data/solar_pv_farms/process_data_component"
import { WindFarmsByYear } from "../../sim_3d/data/wind_farms/process_data_component"
import { SetAppState } from "../interface"
import { DataBlob1, DataState } from "./interface"


export function initial_state(set_state: SetAppState): DataState
{
    return {
        oil_gas_by_year: undefined,
        population_by_year: undefined,
        solar_farms_by_year: undefined,
        wind_farms_by_year: undefined,
        set_data: (data: DataBlob1) =>
        {
            set_state(state =>
            {
                state.data.oil_gas_by_year ||= data.oil_gas_by_year
                state.data.population_by_year ||= data.population_by_year
                state.data.solar_farms_by_year ||= data.solar_farms_by_year
                state.data.wind_farms_by_year ||= data.wind_farms_by_year
            })
        },
        set_oil_gas_by_year: (oil_gas_by_year: OilGasByYear) =>
        {
            set_state(state =>
            {
                state.data.oil_gas_by_year = oil_gas_by_year
            })
        },
        set_population_by_year: (population_by_year: PopulationByYear) =>
        {
            set_state(state =>
            {
                state.data.population_by_year = population_by_year
            })
        },
        set_solar_farms_by_year: (solar_farms_by_year: SolarFarmsByYear) =>
        {
            set_state(state =>
            {
                state.data.solar_farms_by_year = solar_farms_by_year
            })
        },
        set_wind_farms_by_year: (wind_farms_by_year: WindFarmsByYear) =>
        {
            set_state(state =>
            {
                state.data.wind_farms_by_year = wind_farms_by_year
            })
        },


        population: undefined,
        set_population: (population: number) =>
        {
            set_state(state =>
            {
                state.data.population = population
            })
        },
    }
}
