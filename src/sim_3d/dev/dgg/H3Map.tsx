import { geoMercator } from "d3-geo"
import * as h3 from "h3-js"
import { useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { UK_EEZ_COORDS } from "../../data/eez/data"
import { WorldAtlas } from "../interface"
import { UK_ID } from "../map_data"


const resolution = 4

export function H3Map(props: {
    // EEZ_coords: [number, number][],
    // set_cell_count: (n: number) => void,
    // resolution: number,
    // topo_data: WorldAtlas | null,
    // set_is_computing: (b: boolean) => void,
})
{
    const [topo_data, set_topo_data] = useState<WorldAtlas | null>(null)
    const [load_error, set_load_error] = useState<string | null>(null)

    // Fetch world atlas once
    useEffect(() => {
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json() as Promise<WorldAtlas>
            })
            .then(set_topo_data)
            .catch((e) => set_load_error(e.message))
    }, [])


    const uk_coords = useMemo(() =>
    {
        if (!topo_data) return { mergedFill: null, mergedOutline: null }
        const uk = topo_data.objects.countries.geometries.find((c) => c.id === UK_ID)!
        const uk_outline = topo_data.arcs[(uk as any).arcs[0][0]]!

        // Convert arc into lat/lon pairs
        return uk_outline.map(([x, y]) => {
            const [lon, lat] = topo_data.transform && x !== undefined && y !== undefined
                ? [x * topo_data.transform.scale[0] + topo_data.transform.translate[0], y * topo_data.transform.scale[1] + topo_data.transform.translate[1]]
                : [x, y]
            return [lat, lon] as [number, number]
        })
    }, [topo_data])


    return <>

    </>
}


function H3Cells()
{
    const coords = useMemo(() => {
        // set_is_computing(true)
        const cells = h3.polygonToCells(UK_EEZ_COORDS, resolution)
        // props.set_cell_count(cells.length)

        // ------------------------------------------------------------------
        // Projection: Mercator centred on UK, scale calibrated so the
        // EEZ longitude span (~20°) fills the canvas width.
        // ------------------------------------------------------------------
        // Mercator: pixelsPerDegree = scale * π/180
        // We want lonSpan degrees to span W pixels → scale = W*180/(lonSpan*π)
        const W = window.innerWidth
        const H = window.innerHeight
        const LON_SPAN_DEG = 22 // degrees to show across full width
        const scale = (W*30) / (LON_SPAN_DEG * Math.PI)
        const projection = geoMercator()
            .center([-2, 56.5])
            .scale(scale)
            .translate([W / 2, H / 2])
            .clipExtent([[0, 0], [W, H]])

        // const pathGen = geoPath(projection, ctx)


        // Build three.js geometries: extruded fills and outlines, then merge
        const fillGeoms: THREE.BufferGeometry[] = []
        const line_geoms: THREE.BufferGeometry[] = []

        const extrudeDepth = 2 // thin thickness in scene units

        cells.forEach(cell => {
            const boundary = h3.cellToBoundary(cell)
            const pts2: THREE.Vector2[] = []
            boundary.forEach(([lat, lng]) => {
                const pt = projection([lng, lat])
                if (!pt) return
                pts2.push(new THREE.Vector2(pt[0]-700, pt[1]-400))
            })

            if (pts2.length < 3) return

            const shape = new THREE.Shape(pts2)
            const extrude_settings = { depth: extrudeDepth, bevelEnabled: false }
            // ExtrudeGeometry returns a BufferGeometry; cast to BufferGeometry for typing
            const geom = new (THREE as any).ExtrudeGeometry(shape, extrude_settings) as THREE.BufferGeometry
            fillGeoms.push(geom)

            // outline: create a simple line geometry slightly above the extruded top
            const pts3 = pts2.map(p => new THREE.Vector3(p.x, p.y, extrudeDepth + 0.01))
            const line_geom = new THREE.BufferGeometry().setFromPoints(pts3)
            line_geoms.push(line_geom)
        })

        const mergedFill = fillGeoms.length ? mergeGeometries(fillGeoms, true) : null
        const mergedOutline = line_geoms.length ? mergeGeometries(line_geoms, false) : null

        return { mergedFill, mergedOutline }
    }, [UK_EEZ_COORDS, resolution])


    return <>
        <group>
            {coords.mergedFill && (
                <mesh geometry={coords.mergedFill}>
                    <meshStandardMaterial color="skyblue" transparent opacity={0.18} side={THREE.DoubleSide} />
                </mesh>
            )}
            {coords.mergedOutline && (
                <lineSegments geometry={coords.mergedOutline}>
                    <lineBasicMaterial color={0x40be00} linewidth={1} />
                </lineSegments>
            )}
        </group>
    </>
}
