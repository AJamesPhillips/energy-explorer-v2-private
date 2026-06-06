import { geoMercator, GeoProjection } from "d3-geo"
import { useEffect, useMemo, useState } from "react"
import * as THREE from "three"

import { Arc } from "topojson-specification"
import { UK_EEZ_COORDS } from "../data/eez/data"
import { WorldAtlas } from "./interface"
import { UK_ID } from "./map_data"


export function MapUK(props: {
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
        // fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json() as Promise<WorldAtlas>
            })
            .then(set_topo_data)
            .catch((e) => set_load_error(e.message))
    }, [])


    // Build projected extruded geometries for UK country outline and EEZ
    const geometries = useMemo(() => {
        if (!topo_data) return { uk_land: [], uk_eez: [] }

        const uk = topo_data.objects.countries.geometries.find((c) => c.id === UK_ID)
        // There are 23 arcs in the UK geometry
        const uk_arc_ids = (uk as any).arcs.flat().flat() as number[]
        const uk_arcs = uk_arc_ids.map((id: number) => topo_data.arcs[id]).filter((a: Arc | undefined) => a !== undefined) as Arc[]

        // Values are a pair of starting x,y in (with an arbitrary datum that is
        // corrected through topo_data.transform) and then deltas so we need to apply
        // the deltas to get actual coordinates.
        const uk_outline = uk_arcs.map(arc => convert_arcs_to_lonlat(arc, topo_data.transform!))

        // Projection similar to H3Map for consistent sizing/position
        // const W = window.innerWidth
        // const H = window.innerHeight
        // const LON_SPAN_DEG = 22
        const scale = 1000 // (W * 40) / (LON_SPAN_DEG * Math.PI)
        const projection = geoMercator()
            // .center([-2, 56.5])
            .scale(scale)
            // .translate([W / 2, H / 2])

        const uk_geometries = build_geoms(projection, uk_outline)
        const eez_geometries = [build_geom(projection, UK_EEZ_COORDS)].filter(g => !!g)
        debugger

        return { uk_land: uk_geometries, uk_eez: eez_geometries }
    }, [topo_data])


    return <>
        <group>
            {geometries.uk_land.map(({ fill }, index) => (
                <mesh key={index} geometry={fill}>
                    <meshStandardMaterial color={0x999999} metalness={0.1} roughness={0.8} side={THREE.DoubleSide} />
                </mesh>
            ))}
            {geometries.uk_eez.map(({ fill }, index) => (
                <mesh
                    key={index} geometry={fill}
                    // Offset the EEZ down slightly to prevent z-fighting with the land
                    position={[0, -0.1, 0]}
                >
                    <meshStandardMaterial color={0x40beea} transparent opacity={0.18} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    </>
}


// Values are a pair of startinf x,y in (with an arbitrary datum that is
// corrected through topo_data.transform) and then deltas so we need to apply
// the deltas to get actual coordinates.
function convert_arcs_to_lonlat(arc: Arc, transform: { scale: [number, number], translate: [number, number] })
{
    const raw_coords: [number, number][] = []
    let current_x = arc[0]![0]!
    let current_y = arc[0]![1]!
    raw_coords.push([current_x, current_y])

    for (let i = 1; i < arc.length; ++i)
    {
        const [dx, dy] = arc[i]!
        //@ts-ignore - we'll handle any undefined values with the NaN check below
        current_x += dx
        //@ts-ignore - we'll handle any undefined values with the NaN check below
        current_y += dy

        if (Number.isNaN(current_x) || Number.isNaN(current_y)) throw new Error(`Invalid coordinate at index ${i}: (${current_x}, ${current_y})`)

        raw_coords.push([current_x, current_y])
    }

    // Convert arc into lon/lat pairs
    const coords = raw_coords.map(([x, y]) => {
        const lon = x * transform.scale[0] + transform.translate[0]
        const lat = y * transform.scale[1] + transform.translate[1]
        return [lon, lat] as [number, number]
    })

    return coords
}


interface Bounds
{
    min_x: number
    min_y: number
}
const BOUNDS: Bounds =
{
    min_x: 338,
    min_y: -1096,
}

function build_geoms(projection: GeoProjection, outlines: [number, number][][], bounds: Bounds = BOUNDS)
{
    const points_list = outlines.map(coords => points_from_lonlats(coords, projection))

    // This `compute_bounds` was manually run once and the values used to populate
    // the BOUNDS constant.
    // function compute_bounds(points: THREE.Vector2[])
    // {
    //     const xs = points.map(p => p.x)
    //     const ys = points.map(p => p.y)
    //     const min_x = Math.min(...xs)
    //     const min_y = Math.min(...ys)

    //     return { min_x, min_y }
    // }
    // const bounds = compute_bounds(points_list.flat())
    const normalised_points_list = points_list.map(points => normalise_points(points, bounds))

    return normalised_points_list.map(points => points_to_geometries(points))
}


const EXTRUDE_DEPTH = 1
function build_geom (projection: GeoProjection, coords: [number, number][], bounds: Bounds = BOUNDS)
{
    let points: THREE.Vector2[] = points_from_lonlats(coords, projection)
    if (points.length < 3) return null

    points = normalise_points(points, bounds)

    return points_to_geometries(points)
}


function points_to_geometries(points: THREE.Vector2[])
{
    const shape = new THREE.Shape(points)
    const extrude_settings = { depth: EXTRUDE_DEPTH, bevelEnabled: false }
    const fill = new THREE.ExtrudeGeometry(shape, extrude_settings)
    // orient flat on XZ plane
    fill.rotateX(-Math.PI / 2)

    // const outline_points = points.map(p => new THREE.Vector3(p.x, EXTRUDE_DEPTH + 0.01, p.y))
    // const outline = new THREE.BufferGeometry().setFromPoints(outline_points)
    return { fill, outline: null }
}


function points_from_lonlats(coords: [number, number][], projection: GeoProjection)
{
    const points: THREE.Vector2[] = []
    coords.forEach(([lon, lat]) =>
    {
        const point = projection([lon, lat])
        if (!point) return
        points.push(new THREE.Vector2(point[0], point[1]))
    })
    return points
}


function normalise_points(points: THREE.Vector2[], bounds: { min_x: number, min_y: number })
{
    bounds = bounds //|| compute_bounds(points)
    const { min_x, min_y } = bounds

    return points.map(p => new THREE.Vector2(
        p.x - min_x,
        (p.y - min_y) * -1, // Invert Y to convert from screen to Cartesian coordinates
    ))
}
