import { uk_coverage } from "../data/coverage/uk/data"
import { LandOrSea } from "../data/coverage_land/uk/data"
import { CellData, CellsData } from "./interface"
import { get_letter_for_land_or_sea } from "./map_data_compact"


export function generate_map_data_string(size: { x: number, y: number })
{
    const cells = generate_map_data(size)
    let result = ""
    for (let y = 0; y < size.y; ++y)
    {
        for (let x = 0; x < size.x; ++x)
        {
            const cell = cells[x]?.[y]
            if (!cell) throw new Error(`Missing cell at (${x}, ${y})`)

            result += get_letter_for_land_or_sea(cell)
        }
        result += "\n"
    }

    return result.trim()
}



export function generate_map_data(size: { x: number, y: number }): CellsData
{
    const cells: CellsData = {}

    const types_with_ratio = get_types_with_ratio()
    let type_index = 0
    const ratio_increment = 1 / (size.x * size.y)

    for (let y = 0; y < size.y; ++y)
    {
        for (let x = 0; x < size.x; ++x)
        {
            let current_type = types_with_ratio[type_index]!
            if (current_type.ratio <= 0)
            {
                type_index = (type_index + 1) % types_with_ratio.length
                current_type = types_with_ratio[type_index]!
            }
            current_type.ratio -= ratio_increment

            if (!cells[x]) cells[x] = {}
            const { ratio: _, ...rest } = current_type
            const cell: CellData = {
                ...rest,
                id: y * size.x + x,
                x: 0,
                y: 0,
                has_wind_turbine: false,
                has_solar_farm: false,
                has_oil_rig: undefined,
                has_oil_pocket: undefined,
            }
            cells[x]![y] = cell
        }
    }

    return cells
}

// Order of types to generate
function get_types_with_ratio(): (LandOrSea & { ratio: number })[]
{
    return [
        { type: "land", subtype: "rock", ratio: uk_coverage.rock.ratio },
        { type: "land", subtype: "woodland", ratio: uk_coverage.woodland.ratio },
        { type: "land", subtype: "arable", ratio: uk_coverage.arable.ratio },
        { type: "land", subtype: "grassland", ratio: uk_coverage.grassland.ratio },
        { type: "land", subtype: "wetland", ratio: uk_coverage.wetland.ratio },
        { type: "land", subtype: "inland_water", ratio: uk_coverage.inland_water.ratio },
        { type: "land", subtype: "urban", ratio: uk_coverage.urban.ratio },
        { type: "land", subtype: "suburban", ratio: uk_coverage.suburban.ratio },

        { type: "sea", subtype: "shallow", ratio: uk_coverage.shallow.ratio },
        { type: "sea", subtype: "deep", ratio: uk_coverage.deep.ratio },
    ]
}
