
// A initial first pass at a simplified graph of the UK's gas grid.
// It uses the H3 resolution 4 grid

import { h3r4_cells_are_adjacent, paired_h3r4_cell_id, PairedId } from "../../utils/geo/h3_cell_pairs"


const pipelines: string[][] = [
    [
        "8419411ffffffff",
        "8419419ffffffff",
        "84196a5ffffffff",
        "84196a1ffffffff",
        "84196abffffffff",
    ],
    [
        "84196a5ffffffff",
        "84196a7ffffffff",
        "84194c9ffffffff",
        "84194cbffffffff",
    ],
    [
        "8419407ffffffff",
        "8419401ffffffff",
        "8419409ffffffff",
        "8419443ffffffff",
        "841944bffffffff",
        "8419635ffffffff",
        "841963dffffffff",
        "8419607ffffffff",
        "8419601ffffffff",
        "8419609ffffffff",
        "8419643ffffffff",
        "841964bffffffff",
        "8409969ffffffff",
    ],
    [
        "8419769ffffffff",
        "8419293ffffffff",
        "841974dffffffff",
        "8419749ffffffff",
        "8409b69ffffffff",
        "8409b61ffffffff",
        "8409b67ffffffff",
        "8409b2dffffffff",
        "8409b25ffffffff",
        "841964dffffffff",
        "8419649ffffffff",
        "8409969ffffffff",
    ],
    [
        "8419529ffffffff",
        "8419563ffffffff",
        "841950dffffffff",
        "8419547ffffffff",
    ],
    [
        "841950dffffffff",
        "8419505ffffffff",
        "841952bffffffff",
        "8419523ffffffff",
        "84182c9ffffffff",
    ],
]

const initial_connections: PairedId[] = []

pipelines.forEach(pipeline =>
{
    for (let i = 0; i < pipeline.length - 1; ++i)
    {
        const h3r4_id_a = pipeline[i]!
        const h3r4_id_b = pipeline[i + 1]!
        initial_connections.push(paired_h3r4_cell_id(h3r4_id_a, h3r4_id_b))
    }
})


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
