import { useState } from "react"

import { InfoBox } from "../../../components/InfoBox"
import { GraphIcon } from "../../../components/svgs"
import { is_narrow_screen } from "../../../utils/screen_type"
import { OilGasByYear } from "../../data/fossil_fuels/process_data_component"
import { PopulationByYear } from "../../data/population/process_data_component"
import { SolarFarmsByYear } from "../../data/solar_pv/process_data_component"
import { WindFarmsByYear } from "../../data/wind/process_data_component"
import { GraphOilGasProduction, GraphOilGasReserves, GraphOilGasResources } from "./GraphOilGas"
import { GraphPopulation } from "./GraphPopulation"
import { GraphSolarFarms, GraphWindFarms } from "./GraphSolarAndWind"
import "./ui.css"


interface DataPortalProps
{
    year: number

    population_by_year: PopulationByYear | undefined
    population: number | undefined
    set_population: (population: number) => void

    oil_gas_by_year: OilGasByYear | undefined
    solar_farms_by_year: SolarFarmsByYear | undefined
    wind_farms_by_year: WindFarmsByYear | undefined
}
export function DataPortal(props: DataPortalProps)
{
    const [show_data_portal, set_show_data_portal] = useState<boolean>(false)

    const {
        population_by_year, population,
        oil_gas_by_year,
        solar_farms_by_year,
        wind_farms_by_year,
    } = props

    return <div
        className="ui_button"
        style={{ zIndex: "var(--z-index-app-html-data_portal)" }}
        onClick={() => set_show_data_portal(true)}
    >
        <span>
            {is_narrow_screen() ? "" : "Graphs "}<GraphIcon style={{ marginLeft: is_narrow_screen() ? 0 : 5 }} />
        </span>

        {show_data_portal && <InfoBox
            wider_info_box={true}
            message={<div
                // Stop the click from propagating to the background and closing
                // this info box
                onTouchEnd={e => e.stopPropagation()}
                onMouseUp={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
            >
                <h1>Data Graphs <GraphIcon style={{ height: 30 }} /></h1>

                <div style={{ overflowY: "scroll", maxHeight: "50vh", paddingRight: 10, paddingBottom: 30 }}>
                    <Section id="" title="Oil & Gas Reserves" />
                    {oil_gas_by_year && <GraphOilGasReserves
                        year={props.year}
                        oil_gas_by_year={oil_gas_by_year}
                    />}

                    <Section id="" title="Oil & Gas Resources" />
                    {oil_gas_by_year && <GraphOilGasResources
                        year={props.year}
                        oil_gas_by_year={oil_gas_by_year}
                    />}

                    <Section id="" title="Oil & Gas Production" />
                    {oil_gas_by_year && <GraphOilGasProduction
                        year={props.year}
                        oil_gas_by_year={oil_gas_by_year}
                    />}

                    <Section id="" title="Population" />
                    {population && population_by_year && <GraphPopulation
                        year={props.year}
                        population={population}
                        set_population={props.set_population}
                        population_by_year={population_by_year}
                    />}

                    <Section id="" title="Solar Farms" />
                    {population && population_by_year && <GraphSolarFarms
                        year={props.year}
                        solar_farms_by_year={solar_farms_by_year}
                    />}

                    <Section id="" title="Wind Farms" />
                    {population && population_by_year && <GraphWindFarms
                        year={props.year}
                        wind_farms_by_year={wind_farms_by_year}
                    />}
                </div>
            </div>}
            on_close={() => set_show_data_portal(false)}
        />}
    </div>
}


function Section(props: { id: string, title: string })
{
    return <p style={{ marginTop: 50 }} id={"info_section_" + props.id }>
        <b style={{ fontSize: "var(--font-medium)" }}>
            {props.title.toUpperCase()}
        </b>
    </p>
}
