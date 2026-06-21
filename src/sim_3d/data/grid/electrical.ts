
// Ultra-simplification of UK grid
// UK 400 kV grid
// V = 400 kV
// I = 4 kA
// cosϕ = 1  (ϕ = phase angle between voltage and current)
// P = 3**0.5 * V * I * cosϕ

import { h3r4_cells_are_adjacent, paired_h3r4_cell_id, PairedId } from "../../utils/geo/h3_cell_pairs"

// P = 3**0.5 * 400000 * 4000 * 1 = 2.8 GW
export const POWER_PER_LINE = 2.8e9

// A initial first pass at a simplified graph of the UK's electrical grid.
// It uses the H3 resolution 4 grid
// Every cell to cell connection is either 0 or more lines

const initial_connections: [PairedId, number][] = [
    [paired_h3r4_cell_id("841941dffffffff", "8419419ffffffff"), 1],
    [paired_h3r4_cell_id("8419419ffffffff", "84196a5ffffffff"), 2],
    [paired_h3r4_cell_id("84196a5ffffffff", "84196a1ffffffff"), 3],
    // [paired_h3r4_cell_id("84196a1ffffffff", "841941dffffffff"), 4],
    [paired_h3r4_cell_id("8419415ffffffff", "841943bffffffff"), 2],
]


interface ConnectionInfo
{
    paired_id: PairedId
    num_lines: number
}
interface UKElectricalGrid
{
    h3r4_connections: Record<string, ConnectionInfo>
}

const h3r4_connections: Record<string, ConnectionInfo> = {}
initial_connections.forEach(([connection, num_lines]) =>
{
    const valid = h3r4_cells_are_adjacent(connection.h3r4_id_a, connection.h3r4_id_b)
    if (!valid) throw new Error(`Invalid ELECTRICAL connection: ${connection.h3r4_id_a} and ${connection.h3r4_id_b} are not adjacent`)

    h3r4_connections[connection.paired_id] = {
        paired_id: connection,
        num_lines,
    }
})

export const UK_electrical_grid: UKElectricalGrid = {
    h3r4_connections,
}
