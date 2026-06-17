import { CellDataV1, CellsData, OilGasPocket, OilRigConfig, OilRigState } from "./interface"
import { get_land_or_sea_for_letter, LetterType, map_type_to_letter } from "./map_data_compact"


// Note this comes from running `generate_map_data_string({ x: 20, y: 40 })` and
// then dropping the last 20 rows of deep offshore sea
// const map_data = `
// rrwwwwwwwwggggggwwww
// wwwwwwwwwwwwfsffffff
// fffsusffffffffffffff
// ffffffffffggggggusgg
// gggggggggggggggggggg
// ggssggggffffgggggggg
// ggwwwwwggggggsuasggg
// ggsggggggggggggagggg
// ggggouggeeeeeegaggss
// ugggossggeeegggogoog
// ooorooooooooooooooog
// oooooooooooooooooooo
// oooooooooooooooooooo
// oooooooooddooooooooo
// oooooooodddooooooooo
// ooooooodddddddoooooo
// dddddddddddddooooodd
// ddddoddddddddddddddd
// dddoodddddddddoodddd
// dddddddddddddddddddd
// `.trim()

// const infrastructure_map_data = `
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// ____________________
// _________________z__
// ____________________
// _o___z______x_______
// `.trim()

const map_data = `
______________dddddd_____
_____________dddddddd____
____________dddddddddd___
___________ddddddddddd___
__________ddddddggdddd___
__________ddddddgddddd___
dddddddddddddddddddddd___
dddddddddddddddddddddd___
dddddddddddddddddddddd___
dddddddddddddgdddddddd___
dddddddddddddddddddddd___
dddddddddgggggdddddddd___
ddddddgddegggooddddddd___
dddddgrddgggooodddddddd__
ddddddddgggoggggddddddd__
ddddddgdgggggggddddddddd_
ddddddddegwggggddddddddd_
dddddddggwwwgggdddddddddd
dddddddrdwwgggddddddddddd
__ddddddgggggdddddddddddd
_____ddggdggwwsdddddddddd
______ddddggswwgddddddddd
_____-ddddgwwfggddddddddd
___--gggogggwwgggdddddddd
___-gwagoooogfggeoodddddd
___-wggggogoggffggooooddd
-------googoogwwgggoodddd
-------__oooogsufggoodddd
-------__oooouegfggoodddd
_------__ogrgggwwsggooodd
_------__ogggggffggogeood
-------__oogggggwwgfffgoo
-------_oooegggwwfffsgooo
-----___ogggwwwusgfffgooo
---_____ogggwswwgggsgoooo
_______ooooooaggggusaoooo
_______ooooggfgffggsgeo__
______doooggffffuggfgo___
_____ddooggfgooogoooo__--
____ddooweosooooooo___---
___dddoooooooo_______----
__dddoooooo________------
`.trim()


/**
 *   x = oil rig extracting
 *   z = oil rig dormant
 */
const infrastructure_map_data = `
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________o____x__________
_________________________
_______o_________________
_________________________
_________________________
____________________z____
_________________________
_________________________
_________________________
_________________________
_______________________z_
_________________________
________________________o
_________________________
_________________________
________________________z
____________________z____
_________________________
_________________________
_________________________
_________________________
_______________________x_
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
_________________________
`.trim()

type InfraColumn = Record<number, { has_oil_rig: OilRigConfig, has_oil_pocket: OilGasPocket }>
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
                const config: OilRigConfig = { state, built_progress: 1 }
                xy_to_infra[x][y] = { has_oil_rig: config, has_oil_pocket: { ratio_remaining: cell === "x" ? 0.5 : 0 } }
            }
            else if (cell === "o")
            {
                xy_to_infra[x][y] = { has_oil_rig: undefined, has_oil_pocket: { ratio_remaining: 1 } }
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
                // For now map wetland and arable to grassland to make the map
                // prettier to look at.  But removing wetland in particular will
                // change the available plans
                if (cell === map_type_to_letter.land.arable || cell === map_type_to_letter.land.wetland) cell = "g"

                if (!acc[x]) acc[x] = {}
                const cell_data: CellDataV1 = {
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
        }, {} as Record<number, Record<number, CellDataV1>>)
