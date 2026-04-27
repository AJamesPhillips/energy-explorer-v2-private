import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { CellData, OilRigState } from "../interface"


const NUM_SMOKE = 5


interface SingleOilRigProps
{
    x: number
    y: number
    cell_size: number
    state: OilRigState
}

function SingleOilRig({ x, y, cell_size, state }: SingleOilRigProps)
{
    const s = cell_size

    // ── Structural dimensions ──────────────────────────────────────────────
    const leg_h       = s * 0.3
    const leg_r       = s * 0.08
    const leg_spread  = s * 0.23

    const deck_y      = leg_h
    const deck_h      = s * 0.2
    const deck_w      = s * 0.72
    const deck_d      = s * 0.60
    const platform_top = deck_y + deck_h

    const mod_w = s * 0.33,  mod_h = s * 0.21,  mod_d = s * 0.28
    const mod2_w = s * 0.15, mod2_h = s * 0.13, mod2_d = s * 0.19

    const derrick_r   = s * 0.115
    const derrick_h   = s * 0.52

    const rig_active = state === "extracting"
    const flare_x     = s * 0.28
    const flare_z     = -s * 0.27
    const flare_h     = s * 0.40
    const flare_r     = s * 0.018
    const flare_top_y = platform_top + flare_h

    const flame_h     = s * 0.20
    const flame_r     = s * 0.07

    // ── Subsea depths ──────────────────────────────────────────────────────
    const riser_depth  = s * 2.0

    // ── Geometries ─────────────────────────────────────────────────────────
    const leg_geo      = useMemo(() => new THREE.CylinderGeometry(leg_r, leg_r, leg_h, 8), [leg_r, leg_h])
    const deck_geo     = useMemo(() => new THREE.BoxGeometry(deck_w, deck_h, deck_d), [deck_w, deck_h, deck_d])
    const mod_geo      = useMemo(() => new THREE.BoxGeometry(mod_w, mod_h, mod_d), [mod_w, mod_h, mod_d])
    const mod2_geo     = useMemo(() => new THREE.BoxGeometry(mod2_w, mod2_h, mod2_d), [mod2_w, mod2_h, mod2_d])
    const helipad_geo  = useMemo(() => new THREE.CylinderGeometry(s * 0.10, s * 0.10, s * 0.008, 16), [s])
    const derrick_geo  = useMemo(() => new THREE.ConeGeometry(derrick_r, derrick_h, 4), [derrick_r, derrick_h])
    const flare_geo    = useMemo(() => new THREE.CylinderGeometry(flare_r, flare_r, flare_h, 6), [flare_r, flare_h])
    const flame_geo    = useMemo(() => new THREE.ConeGeometry(flame_r, flame_h, 8), [flame_r, flame_h])
    const smoke_geo    = useMemo(() => new THREE.SphereGeometry(s * 0.08, 6, 6), [s])
    const riser_geo    = useMemo(() => new THREE.CylinderGeometry(s * 0.02, s * 0.02, riser_depth, 6), [s, riser_depth])

    // ── Materials ──────────────────────────────────────────────────────────
    const struct_mat   = useMemo(() => new THREE.MeshStandardMaterial({ color: rig_active ? 0xcc9900 : 0x778899 }), [])
    const module_mat   = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x3d4f61 }), [])
    const derrick_mat  = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x99aabb }), [])
    const helipad_mat  = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x778899 }), [])
    const flame_mat    = useMemo(() => new THREE.MeshStandardMaterial({
        color:            0xff5500,
        emissive:         new THREE.Color(0xff3300),
        emissiveIntensity: 1.5,
        transparent:      true,
        opacity:          0.92,
    }), [])
    // One material per smoke puff so opacity can be set independently
    const smoke_mats = useMemo(() =>
        Array.from({ length: NUM_SMOKE }, () => new THREE.MeshStandardMaterial({
            color:      0x555555,
            transparent: true,
            opacity:    0,
            depthWrite: false,
        })),
    [])

    const riser_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x5a6e7a }), [])

    useEffect(() => () =>
    {
        for (const g of [leg_geo, deck_geo, mod_geo, mod2_geo, helipad_geo, derrick_geo, flare_geo, flame_geo, smoke_geo,
                         riser_geo])
            g.dispose()
        for (const m of [struct_mat, module_mat, derrick_mat, helipad_mat, flame_mat, ...smoke_mats,
                         riser_mat])
            m.dispose()
    }, [leg_geo, deck_geo, mod_geo, mod2_geo, helipad_geo, derrick_geo, flare_geo, flame_geo, smoke_geo,
        riser_geo,
        struct_mat, module_mat, derrick_mat, helipad_mat, flame_mat, smoke_mats,
        riser_mat])

    // ── Animation refs ─────────────────────────────────────────────────────
    const flame_ref = useRef<THREE.Mesh>(null)
    const smoke_ref = useRef<(THREE.Mesh | null)[]>([])
    const smoke_phases = useMemo(() => Array.from({ length: NUM_SMOKE }, (_, i) => i / NUM_SMOKE), [])

    useFrame(state =>
    {
        const t = state.clock.elapsedTime
        const o = rig_active ? 1 : 0

        // Flame flicker — scale & colour
        if (flame_ref.current)
        {
            const fy = 1 //0.80 + 0.35 * Math.sin(t * 13.7) + 0.10 * Math.sin(t * 22.3) + 0.05 * Math.sin(t * 7.1)
            const fx = 0.8 + 0.2 * Math.sin(t * 9.3)
            const fz = 0.8 + 0.2 * Math.sin(t * 11.7)
            flame_ref.current.scale.set(fx * o, fy * o, fz * o)
            const yellow = (Math.sin(t * 8) + 1) / 2
            ;(flame_ref.current.material as THREE.MeshStandardMaterial).color.setRGB(1, 0.28 + yellow * 0.42, 0)
        }

        // Smoke puffs drift upward and fade
        smoke_ref.current.forEach((mesh, i) =>
        {
            if (!mesh) return
            const phase = (t * 0.32 + smoke_phases[i]!) % 1
            mesh.position.y = flare_top_y + flame_h * 0.4 + phase * s * 0.6
            mesh.position.x = flare_x + Math.sin(t * 1.1 + i) * s * 0.015
            mesh.scale.setScalar((0.35 + phase * 1.3) * o)
            smoke_mats[i]!.opacity = 0.78 * (1 - phase)
        })
    })

    // ── Leg corner positions ───────────────────────────────────────────────
    const leg_corners: [number, number, number][] = [
        [-leg_spread, leg_h / 2, -leg_spread],
        [ leg_spread, leg_h / 2, -leg_spread],
        [-leg_spread, leg_h / 2,  leg_spread],
        [ leg_spread, leg_h / 2,  leg_spread],
    ]

    return (
        <group position={[x * s, 0, y * s]}>

            {/* Legs */}
            {leg_corners.map((pos, i) => (
                <mesh key={i} geometry={leg_geo} material={struct_mat} position={pos} />
            ))}

            {/* Main deck */}
            <mesh geometry={deck_geo} material={struct_mat} position={[0, deck_y + deck_h / 2, 0]} />

            {/* Accommodation / equipment module */}
            <mesh geometry={mod_geo} material={module_mat}
                position={[-s * 0.10, platform_top + mod_h / 2, s * 0.05]} />

            {/* Secondary equipment module */}
            <mesh geometry={mod2_geo} material={module_mat}
                position={[s * 0.18, platform_top + mod2_h / 2, -s * 0.07]} />

            {/* Helipad on top of main module */}
            <mesh geometry={helipad_geo} material={helipad_mat}
                position={[-s * 0.10, platform_top + mod_h + s * 0.005, s * 0.05]} />

            {/* Drilling derrick (4-sided pyramid) */}
            <mesh geometry={derrick_geo} material={derrick_mat}
                position={[-s * 0.05, platform_top + derrick_h / 2, -s * 0.13]} />

            {/* Flare tower */}
            <mesh geometry={flare_geo} material={derrick_mat}
                position={[flare_x, platform_top + flare_h / 2, flare_z]}
                rotation={[0, 0, -0.2]}
            />

            {/* Animated gas flame */}
            <mesh ref={flame_ref} geometry={flame_geo} material={flame_mat}
                position={[flare_x, flare_top_y + flame_h / 2 - 0.5, flare_z - 0.6]}
                rotation={[Math.PI - 0.2, 0, 0]}
            />

            {/* Animated smoke puffs */}
            {smoke_phases.map((_, i) => (
                <mesh
                    key={i}
                    ref={el => { smoke_ref.current[i] = el }}
                    geometry={smoke_geo}
                    material={smoke_mats[i]}
                    position={[flare_x, flare_top_y - 0.5, flare_z - 0.6]}
                />
            ))}

            {/* Riser pipe running from rig base down to reservoir depth */}
            <mesh geometry={riser_geo} material={riser_mat}
                position={[0, -riser_depth / 2, -s * 0.13]}
            />
        </group>
    )
}


interface OilRigTilesProps
{
    tiles: Array<Pick<CellData, "x" | "y" | "has_oil_rig">>
    cell_size: number
}

export function OilRigTiles({ tiles, cell_size }: OilRigTilesProps)
{
    if (tiles.length === 0) return null

    return <>
        {tiles.map(({ x, y, has_oil_rig }) => {
            const state = has_oil_rig?.state ?? "dormant"

            return <group key={`${x}-${y}`}>
                <SingleOilRig x={x} y={y} cell_size={cell_size} state={state} />
            </group>
        })}
    </>
}
