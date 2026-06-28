
import { get_uk_land_coverage_by_h3r5, LandH3Cell } from "../../sim_3d/data/coverage_land/uk/data"
import { SetAppState } from "../interface"
import { LandCoverageState } from "./interface"


export function initial_state(set_state: SetAppState): LandCoverageState
{
    function set_h3r5_land_cells(h3r5_land_cells: LandH3Cell[])
    {
        set_state(state =>
        {
            state.land_coverage.h3r5_land_cells = h3r5_land_cells
        })
    }

    get_uk_land_coverage_by_h3r5().then(uk_land_coverage_by_h3r5 =>
    {
        set_h3r5_land_cells(uk_land_coverage_by_h3r5)
    })

    return {
        h3r5_land_cells: [],
        set_h3r5_land_cells,
    }
}
