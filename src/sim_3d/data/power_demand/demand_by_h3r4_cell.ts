import { cellToParent } from "h3-js"

import type { DemandByH3R4Cell, DemandGWForH3R4 } from "../../model/interface"
import { LandH3Cell } from "../coverage_land/uk/data"
import { SUBURBAN_DEMAND_MULTIPLIER, URBAN_DEMAND_MULTIPLIER } from "./relative_demand"


export function get_initial_proportional_demand_by_h3r4_cell(h3r5_land_cells: LandH3Cell[]): DemandByH3R4Cell
{
    const demand_by_h3r4: DemandByH3R4Cell = {}
    let total_h5_cells = 0

    h3r5_land_cells.forEach(cell =>
    {
        if (cell.type !== "suburban" && cell.type !== "urban") return
        total_h5_cells++
        const h3_res5_id = cell.h3h5_id
        const h3r4_id = cellToParent(h3_res5_id, 4)

        const entry: DemandGWForH3R4 = demand_by_h3r4[h3r4_id] || {
            h3r4_id,
            proportional_demand: 0,
            demand_GW: 0,
        }

        entry.proportional_demand += cell.type === "suburban" ? SUBURBAN_DEMAND_MULTIPLIER : URBAN_DEMAND_MULTIPLIER
        demand_by_h3r4[h3r4_id] = entry
    })

    Object.values(demand_by_h3r4).forEach(entry =>
    {
        entry.proportional_demand /= total_h5_cells
    })

    return demand_by_h3r4
}
