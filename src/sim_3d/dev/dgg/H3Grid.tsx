import { polygonToCells } from "h3-js"
import { useMemo } from "react"

import { ILatLon } from "core/data/values/LatLon"

import { CONSTANTS } from "../../simple_sim/constants"
import { latlon_objs_to_latlon_tuples } from "../projection"
import { H3Cells } from "./H3Cells"


const { Z_DGG4_OFFSET } = CONSTANTS

export function H3Grid(props: {
    EEZ_coords_lonlat: ILatLon[]
    set_cell_count?: (n: number) => void
    resolution: number
})
{
    const {
        EEZ_coords_lonlat,
        resolution,
    } = props

    const h3_cell_ids = useMemo(() => {
        const EEZ_coords_latlon = latlon_objs_to_latlon_tuples(EEZ_coords_lonlat)
        const cell_ids = polygonToCells(EEZ_coords_latlon, resolution)
        // console.log("H3Grid: cell_ids.length", cell_ids.length)
        props.set_cell_count?.(cell_ids.length)

        return cell_ids.sort()
    }, [EEZ_coords_lonlat, resolution])

    return <H3Cells
        h3_cell_ids={h3_cell_ids}
        y_offset={Z_DGG4_OFFSET}
    />
}
