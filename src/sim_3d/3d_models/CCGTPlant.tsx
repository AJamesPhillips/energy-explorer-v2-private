import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { deg_to_rad } from "../../utils/angle"
import { SmokePuffs } from "./SmokePuffs"


interface CCGTPlantProps
{
    x: number
    y: number
    cell_size: number
}

export function CCGTPlant({ x, y, cell_size }: CCGTPlantProps)
{
    const s = cell_size

    // ── Main hall (turbine building)
    const hall_w = s * 0.55
    const hall_h = s * 0.11
    const hall_d = s * 0.22
    const hall_geo = useMemo(() => new THREE.BoxGeometry(hall_w, hall_h, hall_d), [hall_w, hall_h, hall_d])
    const hall_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x8899aa }), [])

    // ── HRSG (heat recovery steam generator) block
    const hrsg_w = s * 0.15
    const hrsg_h = s * 0.18
    const hrsg_d = s * 0.22
    const hrsg_geo = useMemo(() => new THREE.BoxGeometry(hrsg_w, hrsg_h, hrsg_d), [hrsg_w, hrsg_h, hrsg_d])
    const hrsg_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x778899 }), [])

    // ── Chimney
    const chimney_h = s * 0.55
    const chimneyTopR = s * 0.025
    const chimneyBottomR = s * 0.03
    const chimney_geo = useMemo(() => new THREE.CylinderGeometry(chimneyTopR, chimneyBottomR, chimney_h, 8), [chimneyTopR, chimneyBottomR, chimney_h])
    const chimney_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x888888 }), [])
    const chimney_cap_geo = useMemo(() => new THREE.CylinderGeometry(s * 0.035, s * 0.035, s * 0.02, 8), [s])
    const chimney_cap_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x777777 }), [])

    const geo_mat = [hall_geo, hrsg_geo, chimney_geo, chimney_cap_geo,
        hall_mat, hrsg_mat, chimney_mat, chimney_cap_mat]

    useEffect(() => () =>
    {
        geo_mat.forEach(g => g.dispose())
    }, geo_mat)

    // ── Positions
    const hall_y = hall_h / 2
    const hrsg_pos_x = -s * 0.35
    const hrsg_pos: [number, number, number] = [hrsg_pos_x, hrsg_h / 2, 0]

    const fanXs = [0, 1, 2, 3]

    const chimney_x = -s * 0.37
    const chimney_z = -s * 0.13
    const chimney_top_y = chimney_h

    return (
        <group position={[x * s, 0, y * s]}>

            {/* Turbine hall */}
            <mesh geometry={hall_geo} material={hall_mat} position={[0, hall_y, 0]} />

            {/* HRSG block */}
            <mesh geometry={hrsg_geo} material={hrsg_mat} position={hrsg_pos} />

            {/* Cooling fans row */}
            {fanXs.map(i => <CoolingFan key={i} i={i} hall_h={hall_h} cell_size={cell_size} />)}

            {/* Chimney */}
            <mesh geometry={chimney_geo} material={chimney_mat} position={[chimney_x, chimney_h / 2, chimney_z]} />
            <mesh geometry={chimney_cap_geo} material={chimney_cap_mat} position={[chimney_x, chimney_h + s * 0.01, chimney_z]} />

            {/* Chimney smoke */}
            <SmokePuffs
                position={[chimney_x, chimney_top_y, chimney_z]}
                color={0xaaaaaa}
                puff_radius={s * 0.06}
                rise_height={s * 0.4}
                active={true}
                num_puffs={7}
            />

        </group>
    )
}


function CoolingFan({ i, hall_h, cell_size }: { i: number, hall_h: number, cell_size: number })
{
    const s = cell_size
    const x = (i - 1.5) * s * 0.13

    const fan_housing_h = s * 0.07
    const fan_y = hall_h + fan_housing_h / 2

    // ── Cooling fan housings + fan geometry
    const blade_length = s * 0.09
    const fan_housing_geo = useMemo(() => new THREE.CylinderGeometry(blade_length * 0.6, blade_length * 0.6, s * 0.07), [s])
    const fan_housing_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x99aabb }), [])
    const blade_geo = useMemo(() => new THREE.BoxGeometry(blade_length, s * 0.005, s * 0.015), [s])
    const blade_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xcccccc }), [])

    const geo_mat = [fan_housing_geo, blade_geo, fan_housing_mat, blade_mat]

    useEffect(() => () =>
    {
        geo_mat.forEach(g => g.dispose())
    }, geo_mat)


    const fan_ref = useRef<THREE.Mesh | null>(null)
    useFrame((_, delta) =>
    {
        if (!fan_ref.current) return
        const speed = 4.0 // radians per second
        fan_ref.current.rotation.y += speed * delta
    })

    return <group position={[x, fan_y, 0]}>
        <mesh geometry={fan_housing_geo} material={fan_housing_mat} />

        <group
            ref={fan_ref}
            position={[0, fan_housing_h / 2 + s * 0.002, 0]}
        >
            <mesh geometry={blade_geo} material={blade_mat} />
            <mesh geometry={blade_geo} material={blade_mat}
                rotation={[0, deg_to_rad(90), 0]}
            />
        </group>
    </group>
}
