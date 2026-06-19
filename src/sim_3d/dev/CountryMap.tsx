import * as h3 from "h3-js"
import { useMemo } from "react"
import * as THREE from "three"
import { Arc } from "topojson-specification"

import { ILatLon } from "core/data/values/LatLon"

import { UK_EEZ_COORDS } from "../data/eez/data"
import { COLOURS, CONSTANTS } from "../simple_sim/constants"
import { H3Cells } from "./dgg/H3Cells"
import { WorldAtlas } from "./interface"
import { build_geom, build_geoms, get_projection, latlon_objs_to_latlon_tuples } from "./projection"


const {
    Z_MAP_OFFSET,
    Z_MAP_THICKNESS,
    Z_EEZ_OUTLINE_OFFSET,
    Z_EEZ_OUTLINE_THICKNESS,
    Z_DGG_THICKNESS,
} = CONSTANTS

export function CountryMap(props: {
    topo_data: WorldAtlas | null,
    country_id: string,
    other_country_ids?: Set<string>,
    outline_only?: boolean,
    show_eez_boundary?: boolean,
    resolution_h3?: number,
})
{
    const {
        topo_data,
        other_country_ids = new Set(),
        outline_only = false,
        resolution_h3,
    } = props

    const lat_lon_country_outlines = useMemo(() => {
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
        const country_of_interest_land = CoI_arcs.map(arc => convert_arcs_to_lonlat(arc, topo_data.transform!))
        const other_country_land = other_country_arcs.map(arc => convert_arcs_to_lonlat(arc, topo_data.transform!))

        return {
            country_of_interest_land,
            other_country_land,
        }
    }, [topo_data])


    if (!lat_lon_country_outlines) return null

    return <>
        {props.show_eez_boundary && <RenderEEZOutline />}

        {resolution_h3 !== undefined && <CountryH3Map
            country_of_interest_land={lat_lon_country_outlines.country_of_interest_land}
            resolution={resolution_h3}
        />}
        <RenderCountryOutlines
            country_of_interest_land={resolution_h3 === undefined
                ? lat_lon_country_outlines.country_of_interest_land
                : []
            }
            other_outlines={lat_lon_country_outlines.other_country_land}
            outline_only={outline_only}
        />
    </>
}


// Values are pairs of x,y (with an arbitrary datum that is
// corrected through topo_data.transform)
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
    const coords: ILatLon[] = raw_coords.map(([x, y]) => {
        const lon = x * transform.scale[0] + transform.translate[0]
        const lat = y * transform.scale[1] + transform.translate[1]
        return { lat, lon }
    })

    return coords
}


interface RenderCountryOutlinesProps
{
    country_of_interest_land: ILatLon[][]
    other_outlines: ILatLon[][]
    outline_only?: boolean
}
function RenderCountryOutlines(props: RenderCountryOutlinesProps)
{
    const { country_of_interest_land, other_outlines, outline_only } = props

    // Build projected extruded geometries for outline of country of interest and its EEZ
    const projection = get_projection()
    const CoI_land_geometries = build_geoms(projection, country_of_interest_land, Z_MAP_THICKNESS)
    const other_country_land_geometries = build_geoms(projection, other_outlines, Z_MAP_THICKNESS)

    return <group position={[0, Z_MAP_OFFSET, 0]}>
        {CoI_land_geometries.map(({ fill, outline }, index) => {
            if (outline_only) return <lineSegments key={"outline" + index} geometry={outline}>
                <lineBasicMaterial color={COLOURS.country_outline} linewidth={2} />
            </lineSegments>

            return <mesh key={"land" + index} geometry={fill}>
                <meshStandardMaterial color={COLOURS.country_fill} metalness={0.1} roughness={0.8} side={THREE.DoubleSide} />
            </mesh>
        })}

        {other_country_land_geometries.map(({ fill, outline }, index) => {
            if (outline_only) return <lineSegments key={"outline" + index} geometry={outline}>
                <lineBasicMaterial color={COLOURS.country_outline} linewidth={2} />
            </lineSegments>

            return <mesh key={"land" + index} geometry={fill}>
                <meshStandardMaterial color={COLOURS.country_fill} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
        })}
    </group>
}


interface CountryH3MapProps
{
    country_of_interest_land: ILatLon[][]
    resolution: number
}
function CountryH3Map(props: CountryH3MapProps)
{    const {
        country_of_interest_land,
        resolution,
    } = props

    const h3_cell_ids = useMemo(() => {
        const country_of_interest_land_latlons = country_of_interest_land.map(latlon_objs_to_latlon_tuples)
        const cell_ids = country_of_interest_land_latlons
            .map(outline => h3.polygonToCells(outline, resolution))
            .flat()
        // console.log(cells.join("\n"))

        return cell_ids
    }, [resolution])

    return <>
        <H3Cells
            h3_cell_ids={h3_cell_ids}
            y_offset={Z_DGG_THICKNESS * resolution}
        />
    </>
}


function RenderEEZOutline()
{
    // Build projected extruded geometries for outline of country of interest and its EEZ
    const projection = get_projection()
    const CoI_eez_geometries = [build_geom(projection, UK_EEZ_COORDS, Z_EEZ_OUTLINE_THICKNESS)].filter(g => !!g)

    return <>
        {CoI_eez_geometries.map(({ fill }, index) => (
            <mesh
                key={"eez" + index} geometry={fill}
                position={[0, Z_EEZ_OUTLINE_OFFSET, 0]}
            >
                <meshStandardMaterial color={COLOURS.country_territorial_waters} transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
        ))}
    </>
}
