import { useEffect, useMemo } from "react"
import * as THREE from "three"

import fragmentShader from "../../shaders/glow/fragment.glsl"
import vertexShader from "../../shaders/glow/vertex.glsl"


// Defines a lighting bolt, like that found in the original Energy Explorer logo.
const side_profile_points: { x: number, y: number }[] = [
    { x: 30,  y: 0 },
    { x: 100, y: 230 },
    { x: 0,   y: 220 },
    { x: 45,  y: 445 },
    { x: 170, y: 490 },
    { x: 115, y: 285 },
    { x: 220, y: 300 },
    { x: 220, y: 300 },
]

const max_y = Math.max(...side_profile_points.map(p => p.y))
// Normalise the points & centre x coordinates
side_profile_points.forEach(p =>
{
    p.x = (p.x / max_y) - 0.5
    p.y = p.y / max_y
})


interface LightningBoltProps
{
    x: number
    y: number
    cell_size: number
}

export function LightningBolt({ x, y, cell_size }: LightningBoltProps)
{
    const s = cell_size

    const bolt_geo = useMemo(() => {
        const scale = s * 0.5

        const shape = new THREE.Shape()
        side_profile_points.forEach(({ x, y }, i) => {
            const sx = x * scale
            const sy = y * scale
            if (i === 0) shape.moveTo(sx, sy)
            else         shape.lineTo(sx, sy)
        })

        return new THREE.ExtrudeGeometry(shape, { depth: s * 0.08, bevelEnabled: false })
    }, [s])

    // ── Materials ──────────────────────────────────────────────────────────
    const bolt_mat = useMemo(() => new THREE.MeshStandardMaterial({
        color:             0x44bbff,
        emissive:          new THREE.Color(0x0055ff),
        emissiveIntensity: 1.2,
        transparent:       true,
        opacity:           0.95,
    }), [])

    const glow_mat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms:    { uGlowColour: { value: new THREE.Color(0.05, 0.45, 1.0) } },
        transparent: true,
        depthWrite:  false,
        side:        THREE.BackSide,
        blending:    THREE.AdditiveBlending,
    }), [])

    useEffect(() => () =>
    {
        bolt_geo.dispose()
        bolt_mat.dispose()
        glow_mat.dispose()
    }, [bolt_geo, bolt_mat, glow_mat])

    return (
        <group position={[x * s, 0, y * s]}>
            {/* Glow shell: slightly larger, additive, drawn after main mesh
            <mesh geometry={bolt_geo} material={glow_mat} scale={[1.08, 1.08, 1.08]} renderOrder={10} /> */}

            {/* Main bolt body */}
            <mesh geometry={bolt_geo} material={bolt_mat} renderOrder={0} />
        </group>
    )
}
