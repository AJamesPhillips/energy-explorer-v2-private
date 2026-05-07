import { DataPoint } from "../../data/fossil_fuels/process_data_component"
import { GRAPH_CONSTANTS } from "../constants"

const { PLOT_W, PLOT_H } = GRAPH_CONSTANTS


export interface GraphDataSeries
{
    name: string
    colour: string
    colour_projected: string
    points: { year: number, value: number, is_projected?: boolean }[]
    known_points: { year: number, value: number, x: number, y: number }[]
    known_points_polyline: string // "x1,y1 x2,y2"
    proj_points_polyline: string // "x1,y1 x2,y2"
}
export function graph_compute_data_series<
    Fields extends string[],
    DataRow = {[f in Fields[number]]: DataPoint}
>(
    data_by_year: Record<number, DataRow>,
    colour_by_series: {[f in Fields[number]]: string | false}
): GraphDataSeries[]
{
    const all_years = Object.keys(data_by_year).map(Number).sort((a, b) => a - b)
    const all_rows = all_years.map(y => data_by_year[y]!)
    const series_names = Object.keys(all_rows[0] || {}) as Fields

    const all_values = all_rows.flatMap(row => Object.values(row).map(dp => (dp as DataPoint).value).filter(v => v !== undefined))
    const min_year = all_years[0]!
    const max_year = all_years[all_years.length - 1]!
    const min_value = Math.min(...all_values) * 0.97
    const max_value = Math.max(...all_values) * 1.03

    function x_of(year: number) { return ((year - min_year) / (max_year - min_year)) * PLOT_W() }
    function y_of(pop: number) { return PLOT_H - ((pop - min_value) / (max_value - min_value)) * PLOT_H }


    const data_series: GraphDataSeries[] = []
    series_names.forEach((field: Fields[number]) =>
    {
        const colour = colour_by_series[field]
        if (colour === false) return

        const points: { year: number, value: number, is_projected?: boolean }[] = []
        const known_points: { year: number, value: number, x: number, y: number }[] = []
        const projected_years: { year: number, value: number, x: number, y: number }[] = []
        all_years.forEach(year =>
        {
            const data_row: DataRow = data_by_year[year]!
            const data_point = data_row[field as keyof DataRow] as DataPoint
            if (data_point && data_point.value !== undefined)
            {
                const x = x_of(year)
                const y = y_of(data_point.value)
                points.push({ year, value: data_point.value, is_projected: data_point.is_projected })

                if (!data_point.is_projected)
                {
                    known_points.push({ year, value: data_point.value, x, y })
                }
                else
                {
                    projected_years.push({ year, value: data_point.value, x, y })
                }
            }
        })

        const known_points_polyline = known_points.map(dp => `${dp.x},${dp.y}`).join(" ")
        const proj_start_year = known_points[known_points.length - 1]
        const proj_years_list = [proj_start_year, ...projected_years].filter(dp => dp?.value !== undefined)
        const proj_points_polyline = proj_years_list.map(dp => `${dp!.x},${dp!.y}`).join(" ")

        data_series.push({
            name: field,
            colour,
            colour_projected: colour,
            points,
            known_points,
            known_points_polyline,
            proj_points_polyline,
        })
    })

    return data_series
}


function test()
{
    const result = graph_compute_data_series({
        2020: { oil_reserves: { value: 100, is_projected: false }, gas_reserves: { value: 200, is_projected: true } },
        2021: { oil_reserves: { value: 90 }, gas_reserves: { value: undefined } },
    }, {
        oil_reserves: "black",
        gas_reserves: "blue",
    })
    console.assert(JSON.stringify(result) === JSON.stringify([
        {
            name: "oil_reserves",
            colour: "black",
            points: [
                { year: 2020, value: 100, is_projected: false },
                { year: 2021, value: 90, is_projected: false },
            ]
        },
        {
            name: "gas_reserves",
            colour: "blue",
            points: [
                { year: 2020, value: 200, is_projected: true },
                { year: 2021, value: undefined, is_projected: false },
            ]
        }
    ]))
}
test()
