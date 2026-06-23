import { is_on_wikisim } from "../../../utils/is_on_wikisim"
import { ViewOptions } from "./ViewOptions"


// interface SimRightSideBarProps
// {
//     year: number
//     population_by_year: PopulationByYear | undefined
//     population: number | undefined
//     set_population: (new_population: number) => void

//     oil_gas_by_year: OilGasByYear | undefined
//     solar_farms_by_year: SolarFarmsByYear | undefined
//     wind_farms_by_year: WindFarmsByYear | undefined
// }

export function SimRightSideBar()
{
    const on_wikisim = is_on_wikisim()

    return <>
        {on_wikisim && <div className="app_controls_row" style={{ minHeight: 38 }} />}
        {/* <div className="app_controls_row">
            <Info />
        </div>
        <div className="app_controls_row">
            <DataPortal
                year={props.year}

                population_by_year={props.population_by_year}
                population={props.population}
                set_population={props.set_population}

                oil_gas_by_year={props.oil_gas_by_year}
                solar_farms_by_year={props.solar_farms_by_year}
                wind_farms_by_year={props.wind_farms_by_year}
            />
        </div> */}
        <ViewOptions />
    </>
}
