import { useMemo } from "react"

import { Pipeline, PipelineProps } from "../../3d_models/Pipeline"
import { UK_gas_grid } from "../../data/grid/gas"
import { cell_to_xy } from "../../dev/projection"


export function H3GasGrid()
{
    const { pipeline_props } = useMemo(() =>
    {
        const pipeline_props: PipelineProps[] = []

        Object.values(UK_gas_grid.h3r4_connections).forEach(connection_info =>
        {
            const cell_a_xy = cell_to_xy(connection_info.paired_id.h3r4_id_a)
            const cell_b_xy = cell_to_xy(connection_info.paired_id.h3r4_id_b)

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
