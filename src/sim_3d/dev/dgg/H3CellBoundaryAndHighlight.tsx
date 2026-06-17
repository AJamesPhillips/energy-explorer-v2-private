import { useEffect, useState } from "react"
import * as THREE from "three"

import { COLOURS, CONSTANTS } from "../../simple_sim/constants"
import pub_sub from "../../state/pub_sub"
import { cell_to_geometries } from "../projection"


export function H3CellBoundaryAndHighlight(props: {
    merged_outline: THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>
}) {
    return <>
        <lineSegments geometry={props.merged_outline}>
            <lineBasicMaterial color={COLOURS.dgg_grid} linewidth={2} />
        </lineSegments>
        <HighlightedCell />
    </>
}


function HighlightedCell()
{
    const [highlighted_cell, set_highlighted_cell] = useState<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap> | null>(null)

    useEffect(() =>
    {
        const unsub = pub_sub.sub("on_hover_tile", (cell) =>
        {
            if (!cell) return

            const geometries = cell_to_geometries(cell.h3_id, CONSTANTS.Z_DGG_CELL_HIGHLIGHT_THICKNESS)
            if (!geometries) return
            set_highlighted_cell(geometries.outline)
        })

        return unsub
    }, [])

    return <group position={[0, CONSTANTS.Z_DGG_CELL_HIGHLIGHT_OFFSET, 0]}>
        {highlighted_cell ? <lineSegments geometry={highlighted_cell}>
            <lineBasicMaterial color={COLOURS.dgg_highlight} linewidth={10} />
        </lineSegments> : null}
    </group>
}
