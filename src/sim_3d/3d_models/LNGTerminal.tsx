
import { useEffect, useMemo } from "react"
import * as THREE from "three"



interface LNGTerminalProps
{
    x: number
    y: number
    rotation?: number
}

function StorageTank({ position, radius, height, material }: { position: [number, number, number], radius: number, height: number, material: THREE.MeshStandardMaterial })
{
    const body_geo = useMemo(() => new THREE.CylinderGeometry(radius, radius, height, 28), [radius, height])
    const dome_geo = useMemo(() => new THREE.SphereGeometry(radius, 16, 12), [radius])

    useEffect(() => () =>
    {
        body_geo.dispose()
        dome_geo.dispose()
    }, [body_geo, dome_geo])

    return (
        <group position={position}>
            <mesh geometry={body_geo} material={material} position={[0, height / 2, 0]} />
            {/* <mesh geometry={dome_geo} material={material} position={[0, height + radius * 0.45, 0]} /> */}
        </group>
    )
}

function Pipeline({ start, end, radius = 0.02, material }: { start: [number, number, number], end: [number, number, number], radius?: number, material: THREE.MeshStandardMaterial })
{
    // compute geometry, midpoint and orientation
    const { geo, mid, quat } = useMemo(() => {
        const sV = new THREE.Vector3(...start)
        const eV = new THREE.Vector3(...end)
        const dir = new THREE.Vector3().subVectors(eV, sV)
        const length = dir.length() || 0.0001
        const midpoint = new THREE.Vector3().addVectors(sV, eV).multiplyScalar(0.5)
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 10)
        return { geo: geometry, mid: midpoint, quat: quaternion }
    }, [start[0], start[1], start[2], end[0], end[1], end[2], radius])

    useEffect(() => () => { geo.dispose() }, [geo])

    return <mesh geometry={geo} material={material} position={[mid.x, mid.y, mid.z]} quaternion={quat} />
}

const size = 10
export function LNGTerminal({ x, y, rotation = 0 }: LNGTerminalProps)
{
    // Dock slab
    const dock_w = size * 0.9
    const dock_h = size * 0.05
    const dock_d = size * 0.5
    const dock_geo = useMemo(() => new THREE.BoxGeometry(dock_w, dock_h, dock_d), [dock_w, dock_h, dock_d])
    const dock_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x5b5b5b }), [])

    // Tanks
    const tank_r = size * 0.20
    const tank_h = size * 0.30
    const oil_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.15 }), [])
    const gas_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 0.5, metalness: 0.02 }), [])
    const pipe_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.7 }), [])

    useEffect(() => () =>
    {
        dock_geo.dispose()
        for (const m of [oil_mat, gas_mat, pipe_mat, dock_mat]) (m as THREE.Material).dispose()
    }, [dock_geo, oil_mat, gas_mat, pipe_mat, dock_mat])

    // Tank positions (relative to group origin)
    const tank_z = -size * 0.28
    const tank1_pos: [number, number, number] = [-size * 0.22, 0, tank_z]
    const tank2_pos: [number, number, number] = [ size * 0.22, 0, tank_z]

    // pipeline geometry: start at dock front aligned to tank X, end at tank front side
    const pipe_radius = size * 0.02
    const dock_front_z = dock_d / 2
    const inlet_offset = tank_r * 0.9
    const pipelines = [
        { start: [tank1_pos[0], dock_h + pipe_radius, dock_front_z] as [number, number, number], end: [tank1_pos[0], tank_h * 0.5, tank1_pos[2] + inlet_offset] as [number, number, number] },
        { start: [tank2_pos[0], dock_h + pipe_radius, dock_front_z] as [number, number, number], end: [tank2_pos[0], tank_h * 0.5, tank2_pos[2] + inlet_offset] as [number, number, number] },
    ]

    return (
        <group position={[x, 0, y]} rotation={[0, rotation, 0]}>

            {/* Dock slab */}
            <mesh geometry={dock_geo} material={dock_mat} position={[0, dock_h / 2, 0]} />

            {/* Storage tanks */}
            <StorageTank position={tank1_pos} radius={tank_r} height={tank_h} material={gas_mat} />
            <StorageTank position={tank2_pos} radius={tank_r} height={tank_h} material={gas_mat} />

            {/* Pipelines connecting dock front to tank inlets */}
            {pipelines.map((p, i) => (
                <Pipeline key={i} start={p.start} end={p.end} radius={pipe_radius} material={pipe_mat} />
            ))}

        </group>
    )
}
