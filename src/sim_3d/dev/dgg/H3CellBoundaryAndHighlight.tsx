import { useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils"

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

    const highlightGeo = useMemo(() => highlighted_cell ? line_segments_to_tube_geometry(highlighted_cell, CONSTANTS.Z_DGG_CELL_HIGHLIGHT_THICKNESS) : null, [highlighted_cell])

    return <group position={[0, CONSTANTS.Z_DGG_CELL_HIGHLIGHT_OFFSET - 0.1, 0]}>
        {highlightGeo ? <mesh geometry={highlightGeo}>
            <meshStandardMaterial color={COLOURS.dgg_highlight} emissive={COLOURS.dgg_highlight} emissiveIntensity={0.6} metalness={0.2} roughness={0.4} />
        </mesh> : null}
    </group>
}


function line_segments_to_tube_geometry(line_geom: THREE.BufferGeometry, radius: number) {
    const position = line_geom.getAttribute("position") as THREE.BufferAttribute
    if (!position) return null

    const points: THREE.Vector3[] = []
    for (let i = 0; i < position.count; ++i)
    {
        points.push(new THREE.Vector3().fromBufferAttribute(position, i))
    }

    const tube_geometries: THREE.BufferGeometry[] = []
    for (let i = 0; i + 1 < points.length; i += 2)
    {
        const p0 = points[i]!
        const p1 = points[i + 1]!
        const distance = p0.distanceTo(p1)
        if (distance === 0) continue

        // Create a simple line curve between p0 and p1
        const curve = new THREE.LineCurve3(p0.clone(), p1.clone())
        const geo = new THREE.TubeGeometry(curve, 4, radius, 4, false)
        tube_geometries.push(geo)
    }

    if (tube_geometries.length === 0) return null
    if (tube_geometries.length === 1) return tube_geometries[0]

    return mergeGeometries(tube_geometries, true)
}
