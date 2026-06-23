import { useState } from "react"

import { InfoBox } from "../../../components/InfoBox"
import { GraphIcon } from "../../../components/svgs"
import { get_app_state } from "../../../state/store"
import { is_narrow_screen } from "../../../utils/screen_type"
import { GraphOilGasProduction, GraphOilGasReserves, GraphOilGasResources } from "./GraphOilGas"
import { GraphPopulation } from "./GraphPopulation"
import { GraphSolarFarms, GraphWindFarms } from "./GraphSolarAndWind"
import "./ui.css"


export function DataPortal()
{
    const [show_data_portal, set_show_data_portal] = useState<boolean>(false)
    const year = get_app_state(state => state.game_datetime.get_year())
    const population_by_year = get_app_state(state => state.data.population_by_year)
    const population = get_app_state(state => state.data.population)
    const set_population = get_app_state(state => state.data.set_population)
    const oil_gas_by_year = get_app_state(state => state.data.oil_gas_by_year)
    const solar_farms_by_year = get_app_state(state => state.data.solar_farms_by_year)
    const wind_farms_by_year = get_app_state(state => state.data.wind_farms_by_year)


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
                        year={year}
                        oil_gas_by_year={oil_gas_by_year}
                    />}

                    <Section id="" title="Oil & Gas Resources" />
                    {oil_gas_by_year && <GraphOilGasResources
                        year={year}
                        oil_gas_by_year={oil_gas_by_year}
                    />}

                    <Section id="" title="Oil & Gas Production" />
                    {oil_gas_by_year && <GraphOilGasProduction
                        year={year}
                        oil_gas_by_year={oil_gas_by_year}
                    />}

                    <Section id="" title="Population" />
                    {population && population_by_year && <GraphPopulation
                        year={year}
                        population={population}
                        set_population={set_population}
                        population_by_year={population_by_year}
                    />}

                    <Section id="" title="Solar Farms" />
                    {population && population_by_year && <GraphSolarFarms
                        year={year}
                        solar_farms_by_year={solar_farms_by_year}
                    />}

                    <Section id="" title="Wind Farms" />
                    {population && population_by_year && <GraphWindFarms
                        year={year}
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
