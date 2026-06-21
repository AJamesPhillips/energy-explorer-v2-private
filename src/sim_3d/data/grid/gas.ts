
// A initial first pass at a simplified graph of the UK's gas grid.
// It uses the H3 resolution 4 grid

import { h3r4_cells_are_adjacent, paired_h3r4_cell_id, PairedId } from "../../utils/geo/h3_cell_pairs"


const initial_connections: PairedId[] = [
    paired_h3r4_cell_id("841941dffffffff", "8419419ffffffff"),
    paired_h3r4_cell_id("8419419ffffffff", "84196a5ffffffff"),
    paired_h3r4_cell_id("84196a5ffffffff", "84196a1ffffffff"),
    // paired_h3r4_cell_id("841943bffffffff", "841941dffffffff"),
    paired_h3r4_cell_id("8419415ffffffff", "841943bffffffff"),
]


interface ConnectionInfo
{
    paired_id: PairedId
}
interface UKGasGrid
{
    h3r4_connections: Record<string, ConnectionInfo>
}

const h3r4_connections: Record<string, ConnectionInfo> = {}
initial_connections.forEach(connection =>
{
    const valid = h3r4_cells_are_adjacent(connection.h3r4_id_a, connection.h3r4_id_b)
    if (!valid) throw new Error(`Invalid GAS connection: ${connection.h3r4_id_a} and ${connection.h3r4_id_b} are not adjacent`)

    h3r4_connections[connection.paired_id] = {
        paired_id: connection,
    }
})

export const UK_gas_grid: UKGasGrid = {
    h3r4_connections,
}
