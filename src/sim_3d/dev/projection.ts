import { geoMercator } from "d3-geo"
import * as THREE from "three"

import { ILatLon } from "core/data/values/LatLon"


export interface XY { x: number, y: number }

export function latlon_objs_to_latlon_tuples(latlon: ILatLon[])
{
    return latlon.map(({ lat, lon }) => [lat, lon] as [number, number])
}

export function latlon_tuples_to_objs(latlon: [number, number][]): ILatLon[]
{
    return latlon.map(([ lat, lon ]) => ({ lat, lon }))
}


const UK_SCREEN_POINT_FUDGE =
{
    x: 200,
    y: -1210,
}
// Projection similar to H3Map for consistent sizing/position
// const W = window.innerWidth
// const H = window.innerHeight
// const LON_SPAN_DEG = 22
const scale = 1000 // (W * 40) / (LON_SPAN_DEG * Math.PI)
// let projection: BasicProjection | undefined = undefined
type BasicProjection = (lat_lon: ILatLon) => (XY | null)
let projection: BasicProjection | undefined = undefined
export function get_projection(): BasicProjection
{
    if (projection) return projection
    const core_projection = geoMercator()
        // .center([-2, 56.5])
        .scale(scale)
        // Default for translate is 480, 250.  We change this based on numbers from
        // UK_SCREEN_POINT_FUDGE which are based on running the compute_bounds
        // function inside build_geoms and then adjusting until the EEZ looked
        // like it was in the right place.
        .translate([480 - UK_SCREEN_POINT_FUDGE.x, 250 - UK_SCREEN_POINT_FUDGE.y])
        // Does not yet perform the inversion of Y from screen to Cartesian coordinates
        // .reflectY(true)

    projection = ({ lon, lat }: ILatLon) =>
    {
        const xy = core_projection([lon, lat])
        if (!xy) return null
        return { x: xy[0], y: xy[1] }
    }

    return projection
}


export function build_geoms(projection: BasicProjection, lonlat_polygons: ILatLon[][], extrude_depth: number)
{
    const points_list = lonlat_polygons.map(coords => points_from_lonlats(coords, projection))

    // This `compute_bounds` was manually run once and the values used to populate
    // the UK_SCREEN_POINT_FUDGE constant... and then fudged a bit to get a better fit for the EEZ
    // function compute_bounds(points: THREE.Vector2[])
    // {
    //     const xs = points.map(p => p.x)
    //     const ys = points.map(p => p.y)
    //     const min_x = Math.min(...xs)
    //     const min_y = Math.min(...ys)

    //     return { x: min_x, y: min_y }
    // }
    // const bounds = compute_bounds(points_list.flat())

    return points_list.map(points => points_to_geometries(points, extrude_depth))
}


export function build_geom (projection: BasicProjection, lonlat_polygon: ILatLon[], extrude_depth: number)
{
    let points: THREE.Vector2[] = points_from_lonlats(lonlat_polygon, projection)
    if (points.length < 3) return null

    return points_to_geometries(points, extrude_depth)
}


function points_from_lonlats(lon_lats: ILatLon[], projection: BasicProjection)
{
    const points: THREE.Vector2[] = []
    lon_lats.forEach(lon_lat =>
    {
        const point = projection(lon_lat)
        if (!point) return
        points.push(new THREE.Vector2(point.x, point.y))
    })
    return points
}


export function points_to_geometries(points: THREE.Vector2[], extrude_depth: number)
{
    const shape = new THREE.Shape(points)
    const extrude_settings = { depth: extrude_depth, bevelEnabled: false }
    const fill = new THREE.ExtrudeGeometry(shape, extrude_settings)
    // orient flat on XZ plane
    fill.rotateX(Math.PI / 2)

    const outline_points = points.flatMap((point, index) => {
        const next_point = points[(index + 1) % points.length] ?? point
        return [
            new THREE.Vector3(point.x, extrude_depth + 0.01, point.y),
            new THREE.Vector3(next_point.x, extrude_depth + 0.01, next_point.y),
        ]
    })
    const outline = new THREE.BufferGeometry().setFromPoints(outline_points)
    return { fill, outline }
}
