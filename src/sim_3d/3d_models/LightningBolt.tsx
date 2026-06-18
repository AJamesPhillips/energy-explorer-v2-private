import { useEffect, useMemo } from "react"
import * as THREE from "three"

import fragmentShader from "../../shaders/glow/fragment.glsl"
import vertexShader from "../../shaders/glow/vertex.glsl"
import { CONSTANTS } from "../simple_sim/constants"


const { DEFAULT_SIZE_FOR_TILE_CONTENT: BASE_SIZE } = CONSTANTS

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
    x?: number
    y?: number
    size?: number
    // optional absolute position override
    position?: [number, number, number]
    // vertical offset (local Y) that parent can control
    y_offset?: number
    // scale multiplier applied to the group
    scale?: number
    // allow parent to provide a material (so parent may update color/opacity)
    material?: THREE.Material | null
    glow_material?: THREE.Material | null
    render_order?: number
    ref?: React.Ref<THREE.Group>
}

export function LightningBolt(props: LightningBoltProps)
{
    const {
        x = 0, y = 0, size = BASE_SIZE, position, y_offset: y_offset = 0, scale = 1,
        material: external_material = null,
        glow_material: external_glow_material = null,
        render_order = 0,
        ref,
    } = props

    const bolt_geo = useMemo(() => {
        const scale_for_geo = size * 0.5

        const shape = new THREE.Shape()
        side_profile_points.forEach(({ x, y }, i) => {
            const sx = x * scale_for_geo
            const sy = y * scale_for_geo
            if (i === 0) shape.moveTo(sx, sy)
            else         shape.lineTo(sx, sy)
        })

        const geo = new THREE.ExtrudeGeometry(shape, { depth: size * 0.08, bevelEnabled: false })
        // Ensure normals are present so lighting/shading works correctly
        if ((geo as any).computeVertexNormals) (geo as any).computeVertexNormals()
        return geo
    }, [size])

    // ── Materials (internal defaults) ───────────────────────────────────────
    const internal_bolt_mat = useMemo(() => new THREE.MeshStandardMaterial({
        color:             0x44bbff,
        emissive:          new THREE.Color(0x0055ff),
        emissiveIntensity: 1.2,
        transparent:       true,
        opacity:           0.95,
        side:              THREE.DoubleSide,
    }), [])

    const internal_glow_mat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms:    { uGlowColour: { value: new THREE.Color(0.05, 0.45, 1.0) } },
        transparent: true,
        depthWrite:  false,
        side:        THREE.BackSide,
        blending:    THREE.AdditiveBlending,
    }), [])

    const bolt_mat = external_material ?? internal_bolt_mat

    useEffect(() => () =>
    {
        bolt_geo.dispose()
        if (!external_material) internal_bolt_mat.dispose()
        if (!external_glow_material) internal_glow_mat.dispose()
    }, [bolt_geo, internal_bolt_mat, internal_glow_mat, external_material, external_glow_material])

    const pos = position ?? [x, y_offset, y]

    return <group ref={ref} position={pos} scale={[scale, scale, scale]}>
        {/* Glow shell (optional) */}
        {/* <mesh geometry={bolt_geo} material={glow_mat} scale={[1.08, 1.08, 1.08]} renderOrder={10} /> */}

        {/* Main bolt body */}
        <mesh geometry={bolt_geo} material={bolt_mat} renderOrder={render_order} />
    </group>
}
