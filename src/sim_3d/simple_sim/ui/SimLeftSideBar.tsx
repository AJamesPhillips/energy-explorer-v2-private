import { OilGasByYear } from "../../data/fossil_fuels/process_data_component"
import { PopulationByYear } from "../../data/population/process_data_component"
import { SolarFarmsByYear } from "../../data/solar_pv_farms/process_data_component"
import { WindFarmsByYear } from "../../data/wind_farms/process_data_component"
import { DataPortal } from "./DataPortal"
import { GameDatetimeUI } from "./GameDatetimeUI"
import { Info } from "./Info"


interface SimLeftSideBarProps
{
    year: number
    population_by_year: PopulationByYear | undefined
    population: number | undefined
    set_population: (new_population: number) => void

    oil_gas_by_year: OilGasByYear | undefined
    solar_farms_by_year: SolarFarmsByYear | undefined
    wind_farms_by_year: WindFarmsByYear | undefined
}

export function SimLeftSideBar(props: SimLeftSideBarProps)
{
    return <>
        <div className="app_controls_row justify_left">
            <GameDatetimeUI />
        </div>
        <div className="app_controls_row justify_left">
            <Info />
        </div>
        <div className="app_controls_row justify_left">
            <DataPortal
                year={props.year}

                population_by_year={props.population_by_year}
                population={props.population}
                set_population={props.set_population}

                oil_gas_by_year={props.oil_gas_by_year}
                solar_farms_by_year={props.solar_farms_by_year}
                wind_farms_by_year={props.wind_farms_by_year}
            />
        </div>
    </>
}
