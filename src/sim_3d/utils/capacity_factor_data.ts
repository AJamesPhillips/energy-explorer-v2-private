import { cellToLatLng } from "h3-js"

export interface CapacityData
{
    data: CapacityFactorData | null
    type: "wind" | "solar"
    display_type?: "discrete" | "continuous"
}

export interface CapacityFactorData
{
    date_time_to_index: Map<string, number>
    h3_cell_id_to_index: Map<string, number>
    // The data is stored in a 1D array, where the index is calculated as:
    // index = date_time_index * number_of_h3_cell_ids + h3_cell_id_index
    get_capacity_factor(date_time_or_index: string | number, h3_cell_id_or_index: string | number): number | undefined
    /**
     * Data is a value from 0 to 0.99 of the capacity of the wind / solar PV
     * farm at each date time for each h3 cell id.
     */
    data: Float32Array
}

const cache: Record<string, Promise<CapacityFactorData>> = {}
export async function load_capacity_factor_data(data_path: string): Promise<CapacityFactorData>
{
    if (cache[data_path])
    {
        return cache[data_path]
    }

    const promise = load_capacity_factor_data_inner(data_path)
    cache[data_path] = promise
    return promise
}

async function load_capacity_factor_data_inner(data_path: string): Promise<CapacityFactorData>
{
    return fetch(data_path)
    .then(response => response.text())
    .then(csv_text =>
    {
        // We drop the last line because it is empty
        const lines = csv_text.split("\n").slice(0, -1)

        let line = lines.shift()
        while (line!.startsWith("#"))
        {
            line = lines.shift()
        }
        // Process line as header
        const h3_cell_ids = line!.split(",").slice(1)
        // Check they are ordered
        const sorted_h3_cell_ids = [...h3_cell_ids].sort()
        if (JSON.stringify(h3_cell_ids) !== JSON.stringify(sorted_h3_cell_ids))
        {
            throw new Error("H3 cell ids are not ordered")
        }

        const h3_cell_id_to_index: Map<string, number> = h3_cell_ids
            .reduce((map, h3_cell_id, index) =>
            {
                map.set(h3_cell_id, index)
                return map
            }, new Map<string, number>())

        const date_time_to_index: Map<string, number> = new Map()
        const number_of_h3_cell_ids = h3_cell_id_to_index.size
        const data = new Float32Array(lines.length * number_of_h3_cell_ids)

        const {
            inner_calculate_data_index,
            get_capacity_factor,
        } = factory({
            number_of_h3_cell_ids,
            date_time_to_index,
            h3_cell_id_to_index,
            data,
        })

        lines.forEach((line, date_time_index) =>
        {
            const cols = line.split(",")
            const date_time = cols[0]!
            date_time_to_index.set(date_time, date_time_index)

            cols.slice(1).forEach((capacity_factor_percentage, h3_cell_id_index) =>
            {
                const data_index = inner_calculate_data_index(date_time_index, h3_cell_id_index)
                data[data_index] = parseInt(capacity_factor_percentage) / 100
            })
        })

        return {
            date_time_to_index,
            h3_cell_id_to_index,
            get_capacity_factor,
            data,
        }
    })
}


export function aggregate_to_annual_average(capacity_factor_data: CapacityFactorData): CapacityFactorData
{
    const { date_time_to_index, h3_cell_id_to_index, get_capacity_factor } = capacity_factor_data
    const number_of_h3_cell_ids = h3_cell_id_to_index.size

    const annual_data = new Float32Array(number_of_h3_cell_ids)
    const annual_date_time_to_index: Map<string, number> = new Map()
    const annual_date_time = "annual"
    annual_date_time_to_index.set(annual_date_time, 0)

    let min_capacity_factor = Number.POSITIVE_INFINITY
    let max_capacity_factor = Number.NEGATIVE_INFINITY

    for (let h3_cell_id_index = 0; h3_cell_id_index < number_of_h3_cell_ids; ++h3_cell_id_index)
    {
        for (let date_time_index = 0; date_time_index < date_time_to_index.size; ++date_time_index)
        {
            annual_data[h3_cell_id_index]! += get_capacity_factor(date_time_index, h3_cell_id_index) ?? 0
        }
        // Divide by the number of date times to get the average
        const annual_value = annual_data[h3_cell_id_index]! / date_time_to_index.size
        annual_data[h3_cell_id_index] = annual_value

        min_capacity_factor = Math.min(min_capacity_factor, annual_value)
        max_capacity_factor = Math.max(max_capacity_factor, annual_value)
    }

    // Rescale the annual data to be between 0 and 1
    const range = max_capacity_factor - min_capacity_factor
    for (let h3_cell_id_index = 0; h3_cell_id_index < number_of_h3_cell_ids; ++h3_cell_id_index)
    {
        // annual_data[h3_cell_id_index]! = (annual_data[h3_cell_id_index]! - min_capacity_factor) / range
    }

    return {
        date_time_to_index: annual_date_time_to_index,
        h3_cell_id_to_index,
        get_capacity_factor: (_date_time_or_index: string | number, h3_cell_id_or_index: string | number) =>
        {
            const h3_cell_id_index = typeof h3_cell_id_or_index === "number"
                ? h3_cell_id_or_index : h3_cell_id_to_index.get(h3_cell_id_or_index)
            if (h3_cell_id_index === undefined)
            {
                return undefined
                // throw new Error(`Unknown h3 cell id: ${h3_cell_id_or_index}`)
            }
            const value = annual_data[h3_cell_id_index]
            if (value === undefined)
            {
                throw new Error(`No annual average data for h3 cell id or index: ${h3_cell_id_or_index}`)
            }
            return value
        },
        data: annual_data,
    }
}


export function get_ombre_of_capacity_factors(capacity_factor_data: CapacityFactorData): CapacityFactorData
{
    const { h3_cell_id_to_index } = capacity_factor_data
    const number_of_h3_cell_ids = h3_cell_id_to_index.size

    const ombre_data = new Float32Array(number_of_h3_cell_ids)
    const ombre_date_time_to_index: Map<string, number> = new Map()
    const ombre_date_time = "ombre"
    ombre_date_time_to_index.set(ombre_date_time, 0)

    let min_lat = 47.95
    let max_lat = 63.56
    h3_cell_id_to_index.forEach((h3_cell_id_index, h3_cell_id) =>
    {
        const [lat, _lon] = cellToLatLng(h3_cell_id)

        ombre_data[h3_cell_id_index] = (lat - min_lat) / (max_lat - min_lat)
    })

    return {
        date_time_to_index: ombre_date_time_to_index,
        h3_cell_id_to_index,
        get_capacity_factor: (_date_time_or_index: string | number, h3_cell_id_or_index: string | number) =>
        {
            const h3_cell_id_index = typeof h3_cell_id_or_index === "number"
                ? h3_cell_id_or_index : h3_cell_id_to_index.get(h3_cell_id_or_index)
            if (h3_cell_id_index === undefined)
            {
                throw new Error(`Unknown h3 cell id: ${h3_cell_id_or_index}`)
            }
            const value = ombre_data[h3_cell_id_index]
            if (value === undefined)
            {
                throw new Error(`No ombre data for h3 cell id or index: ${h3_cell_id_or_index}`)
            }
            return value
        },
        data: ombre_data,
    }
}


interface FactoryArgs
{
    number_of_h3_cell_ids: number
    date_time_to_index: Map<string, number>
    h3_cell_id_to_index: Map<string, number>
    data: Float32Array
}
function factory(args: FactoryArgs)
{
    function inner_calculate_data_index(date_time_index: number, h3_cell_id_index: number): number
    {
        return date_time_index * args.number_of_h3_cell_ids + h3_cell_id_index
    }

    function get_capacity_factor(date_time_or_index: string | number, h3_cell_id_or_index: string | number): number | undefined
    {
        const date_time_index = typeof date_time_or_index === "number"
            ? date_time_or_index : args.date_time_to_index.get(date_time_or_index)
        if (date_time_index === undefined)
        {
            throw new Error(`Unknown date time: ${date_time_or_index}`)
        }

        const h3_cell_id_index = typeof h3_cell_id_or_index === "number"
            ? h3_cell_id_or_index : args.h3_cell_id_to_index.get(h3_cell_id_or_index)
        if (h3_cell_id_index === undefined)
        {
            return undefined
            // throw new Error(`Unknown h3 cell id: ${h3_cell_id}`)
        }

        const index = inner_calculate_data_index(date_time_index, h3_cell_id_index)
        const value = args.data[index]
        if (value === undefined)
        {
            throw new Error(`No data for date time or index: ${date_time_or_index} and h3 cell id or index: ${h3_cell_id_or_index}`)
        }
        return value
    }

    return {
        inner_calculate_data_index,
        get_capacity_factor,
    }
}


export function get_capacity_factor_mix(capacity_data: CapacityFactorData, idx1: number, idx2: number, mix: number, cell_id: string): number | undefined
{
    const size = capacity_data.date_time_to_index.size
    if (size === 0) return undefined

    // index normalization (wrap-around)
    const i1 = idx1 % size
    const i2 = idx2 % size

    const cf1 = capacity_data.get_capacity_factor(i1, cell_id)
    const cf2 = capacity_data.get_capacity_factor(i2, cell_id)
    if (cf1 === undefined && cf2 === undefined) return undefined
    if (cf1 === undefined) return cf2
    if (cf2 === undefined) return cf1
    return cf1 * (1 - mix) + cf2 * mix
}
