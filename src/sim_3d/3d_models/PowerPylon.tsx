import { useEffect, useMemo } from "react"
import * as THREE from "three"

import { lerp } from "three/src/math/MathUtils.js"
import { COLOURS } from "../simple_sim/constants"
import { clamp } from "../utils/clamp"
import { LinesWireFrame, LinesWireFrameProps, Pyramid, PyramidProps } from "./Pyramid"


export interface PowerPylonProps
{
    x: number
    y: number
    rotation?: number
    capacity?: number
}

interface PowerLineProps
{
    pylon_a: PowerPylonProps
    pylon_b: PowerPylonProps
    color?: number
}

const BASE_SIZE = 8
const BASE_MAST_HEIGHT = BASE_SIZE * 0.7
const LEG_XZ_SPREAD = BASE_SIZE * 0.35
function get_mast_height(capacity: number)
{
    return BASE_MAST_HEIGHT * (1 + 0.25 * (capacity - 1))
}
function pylon_arm (location: number, max_capacity: number)
{
    const length = BASE_SIZE * lerp(0.6, 0.3, (location - 1) / max_capacity)
    const y = BASE_MAST_HEIGHT * (0.1 + 0.55 + 0.3 * (location - 1))
    const y2 = BASE_MAST_HEIGHT * (0.1 + 0.65 + 0.2 * (location - 1) - 0.04 * (location - 1))
    return { length, y, y2 }
}
const CONSTANTS = {
    waist_factor: 0.2,
    default_rotation: 0,
    default_capacity: 2,
}


export function PowerPylon({ x, y, rotation, capacity }: PowerPylonProps)
{
    // geometry sizes (snake_case)
    const LEG_XZ_SPREAD_half = LEG_XZ_SPREAD / 2
    capacity = clean_capacity(capacity)
    const mast_height = get_mast_height(capacity)

    const waist_y = mast_height * 0.4
    const waist_xz = BASE_SIZE * CONSTANTS.waist_factor
    const waist_xz_half = waist_xz / 2

    // Legs
    const leg_prop: PyramidProps = { size: BASE_SIZE, base_width: waist_xz_half, height: waist_y, inverted: true }
    const leg_props: PyramidProps[] = useMemo(() => [0, 1, 2, 3].map(i => {
        const xd = (i === 0 || i === 3) ? -1 : 1
        const zd = (i < 2) ? -1: 1
        return {
            ...leg_prop,
            position: new THREE.Vector3(xd * waist_xz_half/2, waist_y, zd * waist_xz_half/2),
            point_offset: new THREE.Vector2(xd * LEG_XZ_SPREAD_half, zd * LEG_XZ_SPREAD_half),
            // extra_strut_indices: [i],
            // extra_strut_position: 0.3,
        }
    }), [])

    // Upper mast
    const upper_mast_prop: PyramidProps = {
        size: BASE_SIZE,
        base_width: waist_xz,
        height: mast_height - waist_y,
        position: new THREE.Vector3(0, waist_y, 0),
        // extra_strut_indices: [0, 2],
    }


    const arms = useMemo(() => {
        const arms: { length: number, y: number, y2: number }[] = []
        let cap = 1
        while (cap <= capacity)
        {
            arms.push(pylon_arm(cap, capacity))
            cap++
        }
        return arms
    }, [capacity])

    const triangle_props: LinesWireFrameProps[] = useMemo(() => {
        return arms.map(arm => ({
            size: BASE_SIZE,
            vertices: [
                // 0, arm.y2, 0,
                0, arm.y, 0,  // Just use a simple line
                 arm.length / 2, arm.y, 0,
                -arm.length / 2, arm.y, 0,
            ],
        }))
    }, [arms])

    return (
        <group position={[x, 0, y]} rotation={[0, rotation ?? CONSTANTS.default_rotation, 0]}>
            {leg_props.map((props, i) => <Pyramid key={i} {...props} />)}
            <Pyramid {...upper_mast_prop} />

            {triangle_props.map((triangle, i) => (
                <LinesWireFrame key={i} {...triangle} thickness={0.012} colour={COLOURS.pylon_arm} />
            ))}

            {/* insulator drops on lower arm ends (keep for attachment points)
            <mesh geometry={insulator_geo} material={metal_mat} position={[-arm_lower_len / 2, arm_lower_y - s * 0.03, 0]} rotation={[0, 0, 0]} />
            <mesh geometry={insulator_geo} material={metal_mat} position={[ arm_lower_len / 2, arm_lower_y - s * 0.03, 0]} rotation={[0, 0, 0]} /> */}
        </group>
    )
}

export function PowerLine({ pylon_a, pylon_b, color = 0x555555 }: PowerLineProps)
{
    // compute attachment points on both pylons (respect capacity)
    const points_a = get_pylon_arm_positions(
        pylon_a.x,
        pylon_a.y,
        pylon_a.rotation ?? CONSTANTS.default_rotation,
        clean_capacity(pylon_a.capacity),
    )
    const points_b = get_pylon_arm_positions(
        pylon_b.x,
        pylon_b.y,
        pylon_b.rotation ?? CONSTANTS.default_rotation,
        clean_capacity(pylon_b.capacity),
    )

    const wire_mat = useMemo(() => new THREE.MeshBasicMaterial({ color }), [color])

    // build tube geometries with sag
    const wire_geos = useMemo(() => {
        const geos: THREE.BufferGeometry[] = []
        const segments = 20
        for (let i = 0; i < Math.min(points_a.length, points_b.length); i++)
        {
            const pair1 = points_a[i]!
            const pair2 = points_b[i]!
            pair1.forEach((point1, j) =>
            {
                point1 = point1.clone()
                const point2 = pair2[j]!.clone()

                const span = point1.distanceTo(point2)
                const sag = Math.max(0.02 * BASE_SIZE, span * 0.05)

                const curve_points: THREE.Vector3[] = []
                for (let j = 0; j <= segments; ++j)
                {
                    const t = j / segments
                    const pt = new THREE.Vector3().lerpVectors(point1, point2, t)
                    const sag_offset = Math.sin(Math.PI * t) * sag
                    pt.y -= sag_offset
                    curve_points.push(pt)
                }

                const curve = new THREE.CatmullRomCurve3(curve_points)
                const tube_geo = new THREE.TubeGeometry(curve, Math.max(8, segments), BASE_SIZE * 0.006, 6, false)
                geos.push(tube_geo)
            })
        }
        return geos
    }, [points_a, points_b])

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


function clean_capacity(capacity: number | undefined): 1 | 2 | 3 | 4
{
    if (capacity === undefined) return CONSTANTS.default_capacity as 1 | 2 | 3 | 4
    return clamp(Math.round(capacity), 1, 4) as 1 | 2 | 3 | 4
}



const ROTATIONAL_AXIS = new THREE.Vector3(0, 1, 0)
function get_pylon_arm_positions(x: number, y: number, rotation: number = CONSTANTS.default_rotation, capacity: number): THREE.Vector3[][]
{
    const origin = new THREE.Vector3(x, 0, y)

    const local_points: THREE.Vector3[][] = []
    let cap = 1
    while (cap <= capacity)
    {
        const arm = pylon_arm(cap, capacity)
        const arm_half_span = arm.length / 2
        const left = new THREE.Vector3(-arm_half_span, arm.y, 0)
        const right = new THREE.Vector3( arm_half_span, arm.y, 0)

        local_points.push([left, right])
        cap++
    }

    local_points.forEach(pairs => pairs.forEach(p => p.applyAxisAngle(ROTATIONAL_AXIS, rotation).add(origin)))

    return local_points
}
