import { gridDisk } from "h3-js"


export interface PairedId
{
    h3r4_id_a: string
    h3r4_id_b: string
    paired_id: string
}

export function paired_h3r4_cell_id(h3r4_cell_id_a: string, h3r4_cell_id_b: string): PairedId
{
    let h3r4_id_a = h3r4_cell_id_a
    let h3r4_id_b = h3r4_cell_id_b
    if (h3r4_id_a < h3r4_id_b)
    {
        h3r4_id_a = h3r4_cell_id_b
        h3r4_id_b = h3r4_cell_id_a
    }
    const paired_id = `${h3r4_id_a}_${h3r4_id_b}`
    return { h3r4_id_a, h3r4_id_b, paired_id }
}


export function h3r4_cells_are_adjacent(h3r4_cell_id_a: string, h3r4_cell_id_b: string)
{
    if (h3r4_cell_id_a === h3r4_cell_id_b) return false
    return gridDisk(h3r4_cell_id_a, 1).includes(h3r4_cell_id_b)
}
