import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"


interface SmokePuffsProps
{
    /** Local-space origin where smoke begins — puffs rise upward (+Y) from here */
    position: [number, number, number]
    /** Colour of each puff (e.g. 0x555555 grey, 0xfafafa white steam) */
    color: THREE.ColorRepresentation
    /** Radius of each puff sphere */
    puff_radius: number
    /** Total height the puffs rise before fading out */
    rise_height: number
    rise_speed?: number
    /** Number of simultaneous puff particles (default: 5) */
    num_puffs?: number
    /** When false the puffs disappear (default: true) */
    active?: boolean
}


export function SmokePuffs({
    position,
    color,
    puff_radius,
    rise_height,
    rise_speed = 1,
    num_puffs = 5,
    active = true,
}: SmokePuffsProps)
{
    const puff_geo = useMemo(() => new THREE.SphereGeometry(puff_radius, 6, 6), [puff_radius])

    // One material per puff so opacity can be driven independently
    const puff_mats = useMemo(() =>
        Array.from({ length: num_puffs }, () => new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity:     0,
            depthWrite:  false,
        })),
    [num_puffs, color])

    useEffect(() => () =>
    {
        puff_geo.dispose()
        for (const m of puff_mats) m.dispose()
    }, [puff_geo, puff_mats])

    const puff_refs = useRef<(THREE.Mesh | null)[]>([])
    const phases    = useMemo(() => Array.from({ length: num_puffs }, (_, i) => i / num_puffs), [num_puffs])
    const drift_amp = puff_radius * 0.2   // lateral sway amplitude

    useFrame(state =>
    {
        const t       = state.clock.elapsedTime
        const scale_o = active ? 1 : 0

        puff_refs.current.forEach((mesh, i) =>
        {
            if (!mesh) return
            const phase           = (t * 0.32 * rise_speed + phases[i]!) % 1
            mesh.position.y       = phase * rise_height
            mesh.position.x       = Math.sin(t * 1.1 + i) * drift_amp
            mesh.scale.setScalar((0.35 + phase * 1.3) * scale_o)
            puff_mats[i]!.opacity = 0.78 * (1 - phase)
        })
    })

    return (
        <group position={position}>
            {phases.map((_, i) => (
                <mesh
                    key={i}
                    ref={el => { puff_refs.current[i] = el }}
                    geometry={puff_geo}
                    material={puff_mats[i]}
                />
            ))}
        </group>
    )
}
