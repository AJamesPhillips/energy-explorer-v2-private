import { geoMercator, GeoProjection } from "d3-geo"
import * as THREE from "three"
import { ScreenPointFudge } from "./map_data"


export function flip_lonlat(coords: [number, number][])
{
    return coords.map(([lon, lat]) => [lat, lon] as [number, number])
}


// Projection similar to H3Map for consistent sizing/position
// const W = window.innerWidth
// const H = window.innerHeight
// const LON_SPAN_DEG = 22
const scale = 1000 // (W * 40) / (LON_SPAN_DEG * Math.PI)
let projection: GeoProjection | undefined = undefined
export function get_projection()
{
    projection = projection || geoMercator()
        // .center([-2, 56.5])
        .scale(scale)
        // .translate([W / 2, H / 2])

    return projection
}


export function build_geoms(projection: GeoProjection, lonlat_polygons: [number, number][][], fudge: ScreenPointFudge, extrude_depth: number)
{
    const points_list = lonlat_polygons.map(coords => points_from_lonlats(coords, projection))

    // This `compute_bounds` was manually run once and the values used to populate
    // the BOUNDS constant... and then fudged a bit to get a better fit for the EEZ
    // function compute_bounds(points: THREE.Vector2[])
    // {
    //     const xs = points.map(p => p.x)
    //     const ys = points.map(p => p.y)
    //     const min_x = Math.min(...xs)
    //     const min_y = Math.min(...ys)

    //     return { x: min_x, y: min_y }
    // }
    // const bounds = compute_bounds(points_list.flat())
    const normalised_points_list = points_list.map(points => normalise_points(points, fudge))
    return normalised_points_list.map(points => points_to_geometries(points, extrude_depth))
}


export function build_geom (projection: GeoProjection, lonlat_polygon: [number, number][], fudge: ScreenPointFudge, extrude_depth: number)
{
    let points: THREE.Vector2[] = points_from_lonlats(lonlat_polygon, projection)
    if (points.length < 3) return null

    points = normalise_points(points, fudge)
    return points_to_geometries(points, extrude_depth)
}


function points_from_lonlats(lon_lats: [number, number][], projection: GeoProjection)
{
    const points: THREE.Vector2[] = []
    lon_lats.forEach(lon_lat =>
    {
        const point = projection(lon_lat)
        if (!point) return
        points.push(new THREE.Vector2(point[0], point[1]))
    })
    return points
}


export function normalise_points(points: THREE.Vector2[], fudge: ScreenPointFudge)
{
    fudge = fudge //|| compute_bounds(points)
    const { x, y } = fudge

    return points.map(p => new THREE.Vector2(
        p.x - x,
        (p.y - y) * -1, // Invert Y to convert from screen to Cartesian coordinates
    ))
}


export function points_to_geometries(points: THREE.Vector2[], extrude_depth: number)
{
    const shape = new THREE.Shape(points)
    const extrude_settings = { depth: extrude_depth, bevelEnabled: false }
    const fill = new THREE.ExtrudeGeometry(shape, extrude_settings)
    // orient flat on XZ plane
    fill.rotateX(-Math.PI / 2)

    const outline_points = points.flatMap((point, index) => {
        const next_point = points[(index + 1) % points.length] ?? point
        return [
            new THREE.Vector3(point.x, extrude_depth + 0.01, -point.y),
            new THREE.Vector3(next_point.x, extrude_depth + 0.01, -next_point.y),
        ]
    })
    const outline = new THREE.BufferGeometry().setFromPoints(outline_points)
    return { fill, outline }
}
