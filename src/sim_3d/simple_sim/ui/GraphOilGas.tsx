
import { DATA_UNTIL_YEAR, OilGasByYear } from "../../data/fossil_fuels/process_data_component"
import { Graph, GraphProps } from "./Graph"
import "./Graph.css"


interface GraphOilGasProps
{
    year: number
    oil_gas_by_year: OilGasByYear
}
export function GraphOilGas(props: GraphOilGasProps)
{
    const { oil_gas_by_year } = props

    const graph_props: GraphProps<("oil_reserves" | "gas_reserves" | "cumulative_oil_production" | "cumulative_gas_production")[]> = {
        graph_title: "Oil & Gas",
        data_source_name: "oil_and_gas_reserves",

        year: props.year,
        data_by_year: oil_gas_by_year,
        colour_by_series: {
            oil_reserves: "#e07020",
            gas_reserves: "#2a7ae4",
            cumulative_oil_production: false,
            cumulative_gas_production: false,
        },
        get_values_description: (year, values) =>
        {
            const description = `Oil: ${values.oil_reserves.value ?? "n/a"} Gas: ${values.gas_reserves.value ?? "n/a"}`
            const is_projected = year > DATA_UNTIL_YEAR
            return { description, is_projected }
        }
    }

    return <Graph {...graph_props as any} />
    // return <Graph
    //     graph_title="Oil & Gas"
    //     data_source_name="oil_and_gas_reserves"

    //     year={props.year}
    //     data_by_year={oil_gas_by_year}
    //     colour_by_series={{
    //         oil_reserves: "#e07020",
    //         gas_reserves: "#2a7ae4",
    //         cumulative_oil_production: false,
    //         cumulative_gas_production: false,
    //     }}
    //     get_values_description={values =>
    //     {
    //         const description = `Oil: ${values.oil_reserves.value ?? "n/a"} Gas: ${values.gas_reserves.value ?? "n/a"}`
    //         return { description, is_projected: false }
    //     }}
    // />
}
