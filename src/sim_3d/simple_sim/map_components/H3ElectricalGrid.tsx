import { useMemo } from "react"

import { deg_to_rad } from "../../../utils/angle"
import { PowerLine, PowerPylon, PowerPylonProps } from "../../3d_models/PowerPylon"
import { UK_electrical_grid } from "../../data/grid/electrical"
import { cell_to_xy } from "../../dev/projection"


export function H3ElectricalGrid()
{
    const { pylon_props, line_props } = useMemo(() =>
    {
        const pylon_props: PowerPylonProps[] = []
        const line_props: { pylon_a: PowerPylonProps, pylon_b: PowerPylonProps }[] = []

        Object.values(UK_electrical_grid.h3r4_connections).forEach(connection_info =>
        {
            const pylon_a_xy = cell_to_xy(connection_info.paired_id.h3r4_id_a)
            const pylon_b_xy = cell_to_xy(connection_info.paired_id.h3r4_id_b)

            if (!pylon_a_xy || !pylon_b_xy) return

            const capacity = connection_info.num_lines
            const pylon_a: PowerPylonProps = { ...pylon_a_xy, rotation: deg_to_rad(90), capacity }
            const pylon_b: PowerPylonProps = { ...pylon_b_xy, rotation: deg_to_rad(90), capacity }
            pylon_props.push(pylon_a)
            pylon_props.push(pylon_b)
            line_props.push({ pylon_a, pylon_b })
        })

        return { pylon_props, line_props }
    }, [UK_electrical_grid])


    return <>
        {pylon_props.map((props, index) => <PowerPylon key={index} {...props} />)}
        {line_props.map((props, index) => <PowerLine key={index} {...props} />)}
    </>
}
