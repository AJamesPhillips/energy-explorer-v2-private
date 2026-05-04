import { useState } from "react"

import { InfoBox } from "../../../components/InfoBox"
import { GraphLogo } from "../../../components/svgs"
import { is_narrow_screen } from "../../../utils/screen_type"
import { PopulationByYear } from "../../data/population/process_data_component"
import { GraphPopulation } from "./GraphPopulation"
import "./ui.css"


interface DataPortalProps
{
    population_by_year: PopulationByYear | undefined
    year: number
    population: number | undefined
    set_population: (population: number) => void
}
export function DataPortal(props: DataPortalProps)
{
    const [show_data_portal, set_show_data_portal] = useState<boolean>(false)

    const { population_by_year, population } = props

    return <div
        className="ui_button"
        style={{ zIndex: "var(--z-index-app-html-data_portal)" }}
        onClick={() => set_show_data_portal(true)}
    >
        <span>
            {is_narrow_screen() ? "" : "Graphs "}<GraphLogo style={{ marginLeft: is_narrow_screen() ? 0 : 5 }} />
        </span>

        {show_data_portal && <InfoBox
            wider_info_box={true}
            message={<>
                <h1>Data Graphs <GraphLogo style={{ height: 30 }} /></h1>

                <div style={{ overflowY: "scroll", maxHeight: "50vh", paddingRight: 10 }}>
                    <Section id="" title="Population" />

                    {population && population_by_year && <GraphPopulation
                        {...props}
                        population={population}
                        population_by_year={population_by_year}
                    />}
                </div>
            </>}
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
