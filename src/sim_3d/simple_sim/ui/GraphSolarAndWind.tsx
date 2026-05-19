
import { useState } from "react"
import { SolarFarmsByYear, SolarFields } from "../../data/solar_pv/process_data_component"
import { WindFarmsByYear, WindFields } from "../../data/wind/process_data_component"
import { Graph, GraphProps } from "./Graph"
import "./Graph.css"


const SOLAR_COLOUR = "#e07020"
const WIND_COLOUR = "#2a7ae4"
const WIND_COLOUR_ONSHORE = "#79b3ff"
const WIND_COLOUR_OFFSHORE = "#004d99"


function to_str (num: number | undefined)
{
    if (num === undefined) return "n/a "
    return `${num.toLocaleString()} km² `
}


interface GraphSolarFarmsProps
{
    year: number
    solar_farms_by_year: SolarFarmsByYear | undefined
}
export function GraphSolarFarms(props: GraphSolarFarmsProps)
{
    const { solar_farms_by_year } = props
    if (!solar_farms_by_year) return null

    const graph_props: GraphProps<SolarFields> = {
        graph_title: "Solar Farm Area (km²)",
        data_source_name: "solar_farms_data",
        year: props.year,
        data_by_year: solar_farms_by_year,
        colour_by_series: {
            net_area_km2: false,
            cumulative_area_km2: SOLAR_COLOUR,
        },
        get_values_description: (_year, values) =>
        {
            const value = values.cumulative_area_km2.value
            return {
                description: <><span style={{ color: SOLAR_COLOUR }}>Solar</span>: {to_str(value)}</>,
                is_projected: false,
            }
        }
    }

    return <Graph<SolarFields> {...graph_props} />
}


interface GraphWindFarmsProps
{
    year: number
    wind_farms_by_year: WindFarmsByYear | undefined
}
export function GraphWindFarms(props: GraphWindFarmsProps)
{
    const [show_onoffshore, set_show_onoffshore] = useState(false)

    const { wind_farms_by_year } = props
    if (!wind_farms_by_year) return null

    const graph_props: GraphProps<WindFields> = {
        graph_title: "Wind Farm Area (km²)",
        data_source_name: "wind_farms_data",
        year: props.year,
        data_by_year: wind_farms_by_year,
        colour_by_series: {
            net_area_km2: false,
            cumulative_area_km2: WIND_COLOUR,
            onshore_net_area_km2: false,
            onshore_cumulative_area_km2: show_onoffshore ? WIND_COLOUR_ONSHORE : false,
            offshore_net_area_km2: false,
            offshore_cumulative_area_km2: show_onoffshore ? WIND_COLOUR_OFFSHORE : false,
        },
        get_values_description: (_year, values) =>
        {
            const value = values.cumulative_area_km2.value
            const onshore = values.onshore_cumulative_area_km2.value
            const offshore = values.offshore_cumulative_area_km2.value

            return {
                description: <>
                    {show_onoffshore ? <>
                        <span style={{ color: WIND_COLOUR_ONSHORE }}>Onshore</span>: {to_str(onshore)}
                        <span style={{ color: WIND_COLOUR_OFFSHORE }}>Offshore</span>: {to_str(offshore)}
                    </> : <>
                        <span style={{ color: WIND_COLOUR }}>Wind</span>: {to_str(value)}
                    </>}
                </>,
                is_projected: false,
            }
        }
    }

    return <div>
        <Graph<WindFields> {...graph_props} />
        <label
            style={{ fontSize: "var(--font-small)" }}
            htmlFor="checkbox_show_onoffshore_wind"
        >
            Show on/offshore
        </label>
        <input
            type="checkbox"
            id="checkbox_show_onoffshore_wind"
            checked={show_onoffshore}
            onChange={e => set_show_onoffshore(e.target.checked)}
        />
    </div>
}
