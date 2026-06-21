import { useMemo } from "react"

import { Pipeline, PipelineProps } from "../../3d_models/Pipeline"
import { UK_gas_grid } from "../../data/grid_gas/data"
import { cell_to_xy } from "../../dev/projection"


export function H3GasGrid()
{
    const { pipeline_props } = useMemo(() =>
    {
        const pipeline_props: PipelineProps[] = []

        UK_gas_grid.h3r4_connections.forEach(connection_id =>
        {
            const [cell_a, cell_b] = connection_id.split("_")
            const cell_a_xy = cell_to_xy(cell_a!)
            const cell_b_xy = cell_to_xy(cell_b!)

            if (!cell_a_xy || !cell_b_xy) return

            const pipeline_prop: PipelineProps = { start: cell_a_xy, end: cell_b_xy, type: "gas" }
            pipeline_props.push(pipeline_prop)
        })

        return { pipeline_props }
    }, [UK_gas_grid])


    return <>
        {pipeline_props.map((props, index) => <Pipeline key={index} {...props} />)}
    </>
}
