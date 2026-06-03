import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { LinesWireFrame, LinesWireFrameProps, Pyramid, PyramidProps } from "./Pyramid"


export interface PowerPylonProps
{
    x: number
    y: number
    cell_size: number
    rotation?: number
}

interface PowerLineProps
{
    pylon_a: PowerPylonProps
    pylon_b: PowerPylonProps
    color?: number
}

const mast_height = (cell_size: number) => cell_size * 0.7
const CONSTANTS = {
    mast_height,
    pylon_arm_lower: (cell_size: number) =>({
        length: cell_size * 0.6,
        y: mast_height(cell_size) * 0.55,
        y2: mast_height(cell_size) * 0.65,
    }),
    pylon_arm_upper: (cell_size: number) => ({
        length: cell_size * 0.4,
        y: mast_height(cell_size) * 0.75,
        y2: mast_height(cell_size) * 0.81,
    }),

    leg_spread: (cell_size: number) => cell_size * 0.35,
    waist_factor: 0.2,
    default_rotation: 0,
}

export function get_pylon_arm_positions(x: number, y: number, cell_size: number, rotation: number = CONSTANTS.default_rotation): THREE.Vector3[]
{
    const s = cell_size
    const origin = new THREE.Vector3(x * s, 0, y * s)

    const arm_lower = CONSTANTS.pylon_arm_lower(cell_size)
    const arm_upper = CONSTANTS.pylon_arm_upper(cell_size)

    const arm_lower_half_span = arm_lower.length / 2
    const arm_upper_half_span = arm_upper.length / 2

    const local_points = [
        new THREE.Vector3(-arm_lower_half_span, arm_lower.y, 0),
        new THREE.Vector3( arm_lower_half_span, arm_lower.y, 0),
        new THREE.Vector3(-arm_upper_half_span, arm_upper.y, 0),
        new THREE.Vector3( arm_upper_half_span, arm_upper.y, 0),
    ]

    const rot_axis = new THREE.Vector3(0, 1, 0)
    for (const p of local_points)
        p.applyAxisAngle(rot_axis, rotation).add(origin)

    return local_points
}

export function PowerPylon({ x, y, cell_size, rotation }: PowerPylonProps)
{
    const s = cell_size

    // geometry sizes (snake_case)
    const leg_spread_xz = CONSTANTS.leg_spread(cell_size)
    const leg_spread_xz_half = leg_spread_xz / 2
    const mast_height = CONSTANTS.mast_height(cell_size)

    const waist_y = mast_height * 0.4
    const waist_xz = s * CONSTANTS.waist_factor
    const waist_xz_half = waist_xz / 2

    // Legs
    const leg_prop: PyramidProps = { cell_size, base_width: waist_xz_half, height: waist_y, inverted: true }
    const leg_props: PyramidProps[] = useMemo(() => [0, 1, 2, 3].map(i => {
        const xd = (i === 0 || i === 3) ? -1 : 1
        const zd = (i < 2) ? -1: 1
        return {
            ...leg_prop,
            position: new THREE.Vector3(xd * waist_xz_half/2, waist_y, zd * waist_xz_half/2),
            point_offset: new THREE.Vector2(xd * leg_spread_xz_half, zd * leg_spread_xz_half),
            extra_strut_indices: [i],
            extra_strut_position: 0.3,
        }
    }), [cell_size])

    // Upper mast
    const upper_mast_prop: PyramidProps = {
        cell_size,
        base_width: waist_xz,
        height: mast_height - waist_y,
        position: new THREE.Vector3(0, waist_y, 0),
        extra_strut_indices: [0, 2]//, 1, 2, 3],
    }


    const arm_lower = CONSTANTS.pylon_arm_lower(cell_size)
    const arm_upper = CONSTANTS.pylon_arm_upper(cell_size)

    const triangle_props: LinesWireFrameProps[] = useMemo(() => [
        {
            cell_size,
            vertices: [
                0, arm_lower.y2, 0,
                 arm_lower.length / 2, arm_lower.y, 0,
                -arm_lower.length / 2, arm_lower.y, 0,
            ],
        },
        {
            cell_size,
            vertices: [
                0, arm_upper.y2, 0,
                 arm_upper.length / 2, arm_upper.y, 0,
                -arm_upper.length / 2, arm_upper.y, 0,
            ],
        },
    ], [])

    return (
        <group position={[x * s, 0, y * s]} rotation={[0, rotation ?? CONSTANTS.default_rotation, 0]}>

            {leg_props.map((props, i) => <Pyramid key={i} {...props} />)}
            <Pyramid {...upper_mast_prop} />

            {triangle_props.map((triangle, i) => (
                <LinesWireFrame key={i} {...triangle} />
            ))}

            {/* insulator drops on lower arm ends (keep for attachment points)
            <mesh geometry={insulator_geo} material={metal_mat} position={[-arm_lower_len / 2, arm_lower_y - s * 0.03, 0]} rotation={[0, 0, 0]} />
            <mesh geometry={insulator_geo} material={metal_mat} position={[ arm_lower_len / 2, arm_lower_y - s * 0.03, 0]} rotation={[0, 0, 0]} /> */}

        </group>
    )
}

export function PowerLine({ pylon_a, pylon_b, color = 0x555555 }: PowerLineProps)
{
    // compute attachment points on both pylons
    const points_a = get_pylon_arm_positions(pylon_a.x, pylon_a.y, pylon_a.cell_size, pylon_a.rotation)
    const points_b = get_pylon_arm_positions(pylon_b.x, pylon_b.y, pylon_b.cell_size, pylon_b.rotation)

    const s = (pylon_a.cell_size + pylon_b.cell_size) / 2

    const wire_mat = useMemo(() => new THREE.MeshBasicMaterial({ color }), [color])

    // build tube geometries with sag
    const wire_geos = useMemo(() => {
        const geos: THREE.BufferGeometry[] = []
        const segments = 40
        for (let i = 0; i < Math.min(points_a.length, points_b.length); i++)
        {
            const p0 = points_a[i]!.clone()
            const p1 = points_b[i]!.clone()
            const span = p0.distanceTo(p1)
            const sag = Math.max(0.02 * s, span * 0.05)

            const curve_points: THREE.Vector3[] = []
            for (let j = 0; j <= segments; j++)
            {
                const t = j / segments
                const pt = new THREE.Vector3().lerpVectors(p0, p1, t)
                const sag_offset = Math.sin(Math.PI * t) * sag
                pt.y -= sag_offset
                curve_points.push(pt)
            }

            const curve = new THREE.CatmullRomCurve3(curve_points)
            const tube_geo = new THREE.TubeGeometry(curve, Math.max(8, segments), s * 0.006, 6, false)
            geos.push(tube_geo)
        }
        return geos
    }, [points_a, points_b, s])

    useEffect(() => () =>
    {
        wire_geos.forEach(g => g.dispose())
        wire_mat.dispose()
    }, [wire_geos, wire_mat])

    return (
        <group>
            {wire_geos.map((g, i) => (
                <mesh key={i} geometry={g} material={wire_mat} />
            ))}
        </group>
    )
}
