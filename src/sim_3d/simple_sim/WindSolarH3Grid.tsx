
import { UK_EEZ_COORDS } from "../data/eez/data"
import { H3Grid } from "../dev/dgg/H3Grid"



export function WindSolarH3Grid()
{
    return <H3Grid
        EEZ_coords_lonlat={UK_EEZ_COORDS}
        resolution={4}
        // set_cell_count={set_cell_count}
    />
}
