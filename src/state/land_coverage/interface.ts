import { LandH3Cell } from "../../sim_3d/data/coverage_land/uk/data"


export interface LandCoverageState
{
    h3r5_land_cells: LandH3Cell[]
    set_h3r5_land_cells: (h3r5_land_cells: LandH3Cell[]) => void
}
