import { is_on_wikisim } from "../../../utils/is_on_wikisim"
import { EnergySupplyDemandActions } from "./EnergySupplyDemandActions"
import { EnergySupplyDemandGraph } from "./EnergySupplyDemandGraph"
import { GameDatetimeUI } from "./GameDatetimeUI"
import { GameScore } from "./GameScore"
import { ViewOptions } from "./ViewOptions"


interface SimLeftSideBarProps
{
}

export function SimLeftSideBar(_props: SimLeftSideBarProps)
{
    return <>
        {/* <div className="app_controls_row justify_left" />
        <div className="app_controls_row justify_left" />
        <div className="app_controls_row justify_left">
            <GameScore />
        </div> */}

        <div className="app_controls_row justify_left">
            <EnergySupplyDemandGraph />
        </div>

        <div className="app_controls_row justify_left">
            <GameDatetimeUI />
        </div>

        <div className="app_controls_row justify_left">
            <EnergySupplyDemandActions />
        </div>

    </>
}


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
        <GameScore />
        <ViewOptions />
    </>
}
