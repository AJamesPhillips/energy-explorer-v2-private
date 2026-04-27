import { CellData, CellsData, OilRigConfig, OilRigState } from "./interface"
import { get_land_or_sea_for_letter, LetterType } from "./map_data_compact"


// Note this comes from running `generate_map_data_string({ x: 20, y: 40 })` and
// then dropping the last 20 rows of deep offshore sea
const map_data = `
rrwwwwwwwwggggggwwww
wwwwwwwwwwwwfsffffff
fffsusffffffffffffff
ffffffffffggggggusgg
gggggggggggggggggggg
ggssggggffffgggggggg
ggwwwwwggggggsuasggg
ggsggggggggggggagggg
ggggouggeeeeeegaggss
ugggossggeeegggogoog
ooorooooooooooooooog
oooooooooooooooooooo
oooooooooooooooooooo
oooooooooddooooooooo
oooooooodddooooooooo
ooooooodddddddoooooo
dddddddddddddooooodd
ddddoddddddddddddddd
dddoodddddddddoodddd
dddddddddddddddddddd
`.trim()


/**
 *   x = oil rig extracting
 *   z = oil rig dormant
 */
const infrastructure_map_data = `
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
____________________
_________________z__
____________________
_o___x______z_______
`.trim()

type InfraColumn = Record<number, { has_oil_rig: OilRigConfig, has_oil_pocket?: boolean } | { has_oil_rig?: OilRigConfig, has_oil_pocket: boolean }>
const xy_to_infra: Record<number, InfraColumn> = {}
infrastructure_map_data.split("\n")
    .forEach((line, y) =>
    {
        const cells = line.trim().split("")
        cells.forEach((cell, x) =>
        {
            if (!xy_to_infra[x]) xy_to_infra[x] = {}
            const has_oil_rig = cell === "x" || cell === "z"
            if (has_oil_rig)
            {
                const state: OilRigState = cell === "x" ? "extracting" : "dormant"
                const config: OilRigConfig = { state }
                xy_to_infra[x][y] = { has_oil_rig: config }
            }
            else if (cell === "o")
            {
                xy_to_infra[x][y] = { has_oil_pocket: true }
            }
        })
    })


let id = 0
export const map_data_cells: CellsData = map_data
    .split("\n")
    .reduce((acc, line, y) =>
        {
            const cells = line.trim().split("")
            cells.forEach((cell, x) =>
            {
                if (!acc[x]) acc[x] = {}
                const cell_data: CellData = {
                    ...get_land_or_sea_for_letter(cell as LetterType),
                    id: id++,
                    x,
                    y,
                    has_wind_turbine: false,
                    has_solar_farm: false,
                    has_oil_rig: xy_to_infra[x]![y]?.has_oil_rig,
                    has_oil_pocket: xy_to_infra[x]![y]?.has_oil_pocket,
                }
                acc[x][y] = cell_data
            })

            return acc
        }, {} as Record<number, Record<number, CellData>>)
