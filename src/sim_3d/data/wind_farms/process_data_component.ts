import { DataComponentExtended } from "../../../data/interface"
import { DataPoint } from "../interface"


interface DataRow
{
    net_area_km2: DataPoint
    cumulative_area_km2: DataPoint
    onshore_net_area_km2: DataPoint
    onshore_cumulative_area_km2: DataPoint
    offshore_net_area_km2: DataPoint
    offshore_cumulative_area_km2: DataPoint
}
export type WindFarmsByYear = Record<number, DataRow>
export type WindFields = (keyof DataRow)[]
export type WindFarmsDataByYear<Fields extends string[]> = Record<number, {[f in Fields[number]]: DataPoint}>


export function process_wind_farms_data_component(component: DataComponentExtended): WindFarmsByYear
{
    const {
        onshore_data,
        offshore_data,
        all_data,
    } = JSON.parse(component.computed_value!) as { onshore_data: [number, Record<string, number>][], offshore_data: [number, Record<string, number>][], all_data: [number, Record<string, number>][] }

    const by_year: WindFarmsByYear = {}

    function process_row(row: [number, Record<string, number>], source: "onshore" | "offshore" | "all")
    {
        const year = row[0]
        const values: DataRow = by_year[year] || {
            net_area_km2: { value: 0 },
            cumulative_area_km2: { value: 0 },
            onshore_net_area_km2: { value: 0 },
            onshore_cumulative_area_km2: { value: 0 },
            offshore_net_area_km2: { value: 0 },
            offshore_cumulative_area_km2: { value: 0 },
        }

        const total_area_km2 = row[1]["estimated_area_km2"] ?? 0
        const cumulative_area_km2 = row[1]["estimated_cumulative_area_km2"] ?? 0

        if (source === "onshore")
        {
            values.onshore_net_area_km2.value = total_area_km2
            values.onshore_cumulative_area_km2.value = cumulative_area_km2
        }
        else if (source === "offshore")
        {
            values.offshore_net_area_km2.value = total_area_km2
            values.offshore_cumulative_area_km2.value = cumulative_area_km2
        }
        else if (source === "all")
        {
            values.net_area_km2.value = total_area_km2
            values.cumulative_area_km2.value = cumulative_area_km2
        }

        by_year[year] = values
    }

    onshore_data.forEach(row => process_row(row, "onshore"))
    offshore_data.forEach(row => process_row(row, "offshore"))
    all_data.forEach(row => process_row(row, "all"))

    return by_year
}
