import { DataComponentExtended } from "../../../data/interface"
import { DataPoint } from "../interface"


interface DataRow
{
    oil_reserves: DataPoint
    gas_reserves: DataPoint
    oil_resources: DataPoint
    gas_resources: DataPoint
    oil_production: DataPoint
    gas_production: DataPoint
}
export type OilGasByYear = Record<number, DataRow>
export type OilGasDataByYear<Fields extends string[]> = Record<number, {[f in Fields[number]]: DataPoint}>

export const DATA_UNTIL_YEAR = 2024
// Not using a simple linear projection for reserves as this was strongly
// criticised on LinkedIn, instead we'll aim to give people programmatic control
// over how production, reserves and resources play out given their actions.
export const INCLUDE_PROJECTION_UNTIL = false
export const PROJECTION_UNTIL_YEAR = 2031
export const OIL_GAS_RESERVES_CONFIDENCE = "2P"
export const OIL_GAS_RESOURCES_CONFIDENCE = "3C"
export const OIL_UNITS = { long: "million tonnes", short: "Mt" }
export const GAS_UNITS = { long: "billion cubic metres", short: "bcm" }

export function process_uk_oil_gas_data_component(component: DataComponentExtended): OilGasByYear
{
    const { data } = JSON.parse(component.computed_value!) as { data: [number, Record<string, number>][] }
    const oil_gas_by_year_raw: OilGasByYear = {}

    data.forEach(row =>
    {
        const year = row[0]
        const oil_reserves = row[1]["Oil Reserves " + OIL_GAS_RESERVES_CONFIDENCE]
        const gas_reserves = row[1]["Gas Reserves " + OIL_GAS_RESERVES_CONFIDENCE]
        const oil_resources = row[1]["Oil Resources " + OIL_GAS_RESOURCES_CONFIDENCE]
        const gas_resources = row[1]["Gas Resources " + OIL_GAS_RESOURCES_CONFIDENCE]
        const oil_production = row[1]["Oil Production"]
        const gas_production = row[1]["Net Gas Production"]

        const is_projected = year > DATA_UNTIL_YEAR

        const values: DataRow = {
            oil_reserves: { value: oil_reserves, is_projected },
            gas_reserves: { value: gas_reserves, is_projected },
            oil_resources: { value: oil_resources, is_projected },
            gas_resources: { value: gas_resources, is_projected },
            oil_production: { value: oil_production, is_projected },
            gas_production: { value: gas_production, is_projected },
        }

        oil_gas_by_year_raw[year] = values
    })

    return oil_gas_by_year_raw
}
