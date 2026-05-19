import { DataComponentExtended } from "../../../data/interface"
import { DataPoint } from "../interface"


interface DataRow
{
    net_area_km2: DataPoint
    cumulative_area_km2: DataPoint
}
export type SolarFarmsByYear = Record<number, DataRow>
export type SolarFields = (keyof DataRow)[]
export type SolarFarmsDataByYear<Fields extends string[]> = Record<number, {[f in Fields[number]]: DataPoint}>


export function process_solar_farms_data_component(component: DataComponentExtended): SolarFarmsByYear
{
    const { data } = JSON.parse(component.computed_value!) as { data: [number, Record<string, number>][] }
    const by_year: SolarFarmsByYear = {}
    let cumulative_area_km2 = 0

    data.forEach(row =>
    {
        const year = row[0]
        const total_area_km2 = row[1]["total area (km^2)"] ?? 0
        cumulative_area_km2 += total_area_km2

        const values: DataRow = {
            net_area_km2: { value: total_area_km2 },
            cumulative_area_km2: { value: cumulative_area_km2 },
        }

        by_year[year] = values
    })

    return by_year
}
