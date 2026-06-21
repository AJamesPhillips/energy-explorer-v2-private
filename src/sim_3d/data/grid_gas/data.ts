
// A initial first pass at a simplified graph of the UK's gas grid.
// It uses the H3 resolution 4 grid

interface UKGasGrid
{
    h3r4_connections: string[]
}

export const UK_gas_grid: UKGasGrid = {
    h3r4_connections: [
        paired_h3r4_cell_id("841941dffffffff", "8419419ffffffff"),
        paired_h3r4_cell_id("8419419ffffffff", "84196a5ffffffff"),
        paired_h3r4_cell_id("84196a5ffffffff", "84196a1ffffffff"),
        paired_h3r4_cell_id("84196a1ffffffff", "8419415ffffffff"),
        paired_h3r4_cell_id("8419415ffffffff", "841943bffffffff"),
    ]
}

function paired_h3r4_cell_id(h3r4_cell_id_a: string, h3r4_cell_id_b: string): string
{
    if (h3r4_cell_id_a < h3r4_cell_id_b)
    {
        return `${h3r4_cell_id_a}_${h3r4_cell_id_b}`
    }
    else
    {
        return `${h3r4_cell_id_b}_${h3r4_cell_id_a}`
    }
}
