
// Ultra-simplification of UK grid
// UK 400 kV grid
// V = 400 kV
// I = 4 kA
// cosϕ = 1  (ϕ = phase angle between voltage and current)
// P = 3**0.5 * V * I * cosϕ
// P = 3**0.5 * 400000 * 4000 * 1 = 2.8 GW
export const POWER_PER_LINE = 2.8e9

// const UK_400KV_GRID = {

// A initial first pass at a simplified graph of the UK's electrical grid.
// It uses the H3 resolution 4 grid
// Every cell to cell connection is either 0 or more lines

interface UKElectricalGrid
{
    h3r4_connections: Record<string, number>
}

export const UK_electrical_grid: UKElectricalGrid = {
    h3r4_connections: {
        [paired_h3r4_cell_id("841941dffffffff", "8419419ffffffff")]: 1,
        [paired_h3r4_cell_id("8419419ffffffff", "84196a5ffffffff")]: 2,
        [paired_h3r4_cell_id("84196a5ffffffff", "84196a1ffffffff")]: 3,
        [paired_h3r4_cell_id("84196a1ffffffff", "8419415ffffffff")]: 4,
        [paired_h3r4_cell_id("8419415ffffffff", "841943bffffffff")]: 2,
    }
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
