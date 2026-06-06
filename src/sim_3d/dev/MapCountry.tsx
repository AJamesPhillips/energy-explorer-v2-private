import { useMemo } from "react"
import * as THREE from "three"
import { Arc } from "topojson-specification"

import { UK_EEZ_COORDS } from "../data/eez/data"
import { WorldAtlas } from "./interface"
import { UK_SCREEN_POINT_FUDGE } from "./map_data"
import { build_geom, build_geoms, get_projection } from "./projection"


const EXTRUDE_DEPTH = 1

export function MapCountry(props: {
    topo_data: WorldAtlas | null,
    country_id: string,
    other_country_ids?: Set<string>,
})
{
    const {
        topo_data,
        other_country_ids = new Set(),
    } = props

    // Build projected extruded geometries for outline of country of interest and its EEZ
    const geometries = useMemo(() => {
        if (!topo_data) return null

        // Country of Interest (CoI)
        const country_of_interest = topo_data.objects.countries.geometries.find((c) => c.id === props.country_id)
        // There maybe many arcs in a country, e.g. the UK geometry has 23 -
        // check if all are nearby or if some are other territories (e.g. overseas territories) that we want to exclude
        const CoI_arc_ids = (country_of_interest as any).arcs.flat().flat() as number[]
        const CoI_arcs = CoI_arc_ids.map((id: number) => topo_data.arcs[id]).filter((a: Arc | undefined) => a !== undefined) as Arc[]

        const other_countries = topo_data.objects.countries.geometries.filter(c => typeof(c.id) === "string" && other_country_ids.has(c.id))
        const other_arc_ids = other_countries.flatMap((c) => (c as any).arcs.flat().flat() as number[])
        const other_country_arcs = other_arc_ids.map((id: number) => topo_data.arcs[id]).filter((a: Arc | undefined) => a !== undefined) as Arc[]

        // Values are a pair of starting x,y in (with an arbitrary datum that is
        // corrected through topo_data.transform) and then deltas so we need to apply
        // the deltas to get actual coordinates.
        const CoI_outline = CoI_arcs.map(arc => convert_arcs_to_lonlat(arc, topo_data.transform!))
        const other_outlines = other_country_arcs.map(arc => convert_arcs_to_lonlat(arc, topo_data.transform!))

        const projection = get_projection()
        const CoI_geometries = build_geoms(projection, CoI_outline, UK_SCREEN_POINT_FUDGE, EXTRUDE_DEPTH)
        const eez_geometries = [build_geom(projection, UK_EEZ_COORDS, UK_SCREEN_POINT_FUDGE, EXTRUDE_DEPTH)].filter(g => !!g)
        const other_geometries = build_geoms(projection, other_outlines, UK_SCREEN_POINT_FUDGE, EXTRUDE_DEPTH)

        return {
            CoI_land: CoI_geometries,
            CoI_EEZ: eez_geometries,
            other_country_land: other_geometries,
        }
    }, [topo_data])


    if (!geometries) return null

    return <>
        <group>
            {geometries.CoI_land.map(({ fill }, index) => (
                <mesh key={"land" + index} geometry={fill}>
                    <meshStandardMaterial color={0x999999} metalness={0.1} roughness={0.8} side={THREE.DoubleSide} />
                </mesh>
            ))}
            {geometries.CoI_EEZ.map(({ fill }, index) => (
                <mesh
                    key={"eez" + index} geometry={fill}
                    // Offset the EEZ down slightly to prevent z-fighting with the land
                    position={[0, -0.1, 0]}
                >
                    <meshStandardMaterial color={0x40beea} transparent opacity={0.18} side={THREE.DoubleSide} />
                </mesh>
            ))}

            {geometries.other_country_land.map(({ fill }, index) => (
                <mesh key={"land" + index} geometry={fill}>
                    <meshStandardMaterial color={0x999999} transparent opacity={0.3} side={THREE.DoubleSide} />
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
