
import { DATA_UNTIL_YEAR, GAS_UNITS, OIL_GAS_RESERVES_CONFIDENCE, OIL_GAS_RESOURCES_CONFIDENCE, OIL_UNITS, OilGasByYear, OilGasDataByYear } from "../../data/fossil_fuels/process_data_component"
import { DataPoint } from "../../data/interface"
import { InfoSectionId } from "../../state/pub_sub/interface"
import { Graph, GraphProps } from "./Graph"
import "./Graph.css"


interface GraphOilGasProps
{
    year: number
    oil_gas_by_year: OilGasByYear
}

const OIL_COLOUR = "#e07020"
const GAS_COLOUR = "#2a7ae4"

type Fields = [
    "oil_reserves", "gas_reserves",
    "oil_resources", "gas_resources",
    "oil_production", "gas_production",
]

function to_str (num: number | undefined, units: string)
{
    if (!num) return "n/a "
    return `${num.toLocaleString()} ${units} `
}

function get_oil_gas_description(oil: number | undefined, gas: number | undefined)
{
    return <>
        <span style={{ color: OIL_COLOUR }}>Oil</span>: {to_str(oil, OIL_UNITS.short)}
        <span style={{ color: GAS_COLOUR }}>Gas</span>: {to_str(gas, GAS_UNITS.short)}
    </>
}

function create_oil_gas_graph_props(args: {
    graph_title: string
    data_source_name: InfoSectionId
    year: number
    data_by_year: OilGasDataByYear<Fields>
    colour_by_series: {[f in Fields[number]]: string | false}
    get_oil_value: (values: {[f in Fields[number]]: DataPoint}) => number | undefined
    get_gas_value: (values: {[f in Fields[number]]: DataPoint}) => number | undefined
    is_projected: (year: number, values: {[f in Fields[number]]: DataPoint}) => boolean
}): GraphProps<Fields>
{
    return {
        graph_title: args.graph_title,
        data_source_name: args.data_source_name,

        year: args.year,
        data_by_year: args.data_by_year,
        colour_by_series: args.colour_by_series,
        get_values_description: (year, values) =>
        {
            const description = get_oil_gas_description(
                args.get_oil_value(values),
                args.get_gas_value(values),
            )
            const is_projected = args.is_projected(year, values)
            return { description, is_projected }
        },
    }
}


export function GraphOilGasReserves(props: GraphOilGasProps)
{
    const { oil_gas_by_year } = props

    const graph_props = create_oil_gas_graph_props({
        graph_title: "Oil & Gas Reserves",
        data_source_name: "oil_and_gas_data",
        year: props.year,
        data_by_year: oil_gas_by_year,
        colour_by_series: {
            oil_reserves: OIL_COLOUR,
            gas_reserves: GAS_COLOUR,
            oil_resources: false,
            gas_resources: false,
            oil_production: false,
            gas_production: false,
        },
        get_oil_value: values => values.oil_reserves.value,
        get_gas_value: values => values.gas_reserves.value,
        is_projected: year => year > DATA_UNTIL_YEAR,
    })

    return <div>
        <Graph<Fields> {...graph_props} />
        <div style={{ fontSize: "var(--font-small)" }}>
            Showing {OIL_GAS_RESERVES_CONFIDENCE} reserves
        </div>
    </div>
}


export function GraphOilGasResources(props: GraphOilGasProps)
{
    const { oil_gas_by_year } = props

    const graph_props = create_oil_gas_graph_props({
        graph_title: "Oil & Gas Resources",
        data_source_name: "oil_and_gas_data",
        year: props.year,
        data_by_year: oil_gas_by_year,
        colour_by_series: {
            oil_reserves: false,
            gas_reserves: false,
            oil_resources: OIL_COLOUR,
            gas_resources: GAS_COLOUR,
            oil_production: false,
            gas_production: false,
        },
        get_oil_value: values => values.oil_resources.value,
        get_gas_value: values => values.gas_resources.value,
        is_projected: year => year > DATA_UNTIL_YEAR,
    })

    return <div>
        <Graph<Fields> {...graph_props} />
        <div style={{ fontSize: "var(--font-small)" }}>
            Showing {OIL_GAS_RESOURCES_CONFIDENCE} resources
        </div>
    </div>
}


export function GraphOilGasProduction(props: GraphOilGasProps)
{
    const graph_props = create_oil_gas_graph_props({
        graph_title: "Oil & Gas Annual Production",
        data_source_name: "oil_and_gas_data",
        year: props.year,
        data_by_year: props.oil_gas_by_year,
        colour_by_series: {
            oil_reserves: false,
            gas_reserves: false,
            oil_resources: false,
            gas_resources: false,
            oil_production: OIL_COLOUR,
            gas_production: GAS_COLOUR,
        },
        get_oil_value: values => values.oil_production.value,
        get_gas_value: values => values.gas_production.value,
        is_projected: () => false
    })

    return <Graph<Fields> {...graph_props} />
}
