import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"


interface BatteryStorageProps
{
    x: number
    y: number
    cell_size: number
}

export function BatteryStorage({ x, y, cell_size }: BatteryStorageProps)
{
    const s = cell_size

    // ── base slab
    const base_w = s * 0.72
    const base_h = s * 0.018
    const base_d = s * 0.62
    const base_geo = useMemo(() => new THREE.BoxGeometry(base_w, base_h, base_d), [base_w, base_h, base_d])
    const base_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xb0b0b0 }), [])

    // ── container geometry
    const cont_w = s * 0.15
    const cont_h = s * 0.075
    const cont_d = s * 0.17
    const cont_geo = useMemo(() => new THREE.BoxGeometry(cont_w, cont_h, cont_d), [cont_w, cont_h, cont_d])
    const cont_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xf2f2f2 }), [])

    // ── door seam geometry (thin darker plane)
    const seam_geo = useMemo(() => new THREE.BoxGeometry(cont_w * 0.9, cont_h * 0.9, 0.002), [cont_w, cont_h])
    const seam_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xd6d6d6 }), [])

    // ── status light
    const light_geo = useMemo(() => new THREE.CylinderGeometry(s * 0.008, s * 0.008, s * 0.003, 6), [s])
    const light_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x22cc44, emissive: 0x22cc44, emissiveIntensity: 1.0 }), [])

    useEffect(() => () =>
    {
        for (const g of [base_geo, cont_geo, seam_geo, light_geo])
            g.dispose()
        for (const m of [base_mat, cont_mat, seam_mat, light_mat])
            m.dispose()
    }, [base_geo, cont_geo, seam_geo, light_geo, base_mat, cont_mat, seam_mat, light_mat])

    // ── grid layout 4 × 3 (columns × rows)
    const cols = 4
    const rows = 3
    const gap_x = 0.01 * s
    const gap_z = 0.01 * s

    const total_w = cols * cont_w + (cols - 1) * gap_x
    const total_d = rows * cont_d + (rows - 1) * gap_z
    const start_x = -total_w / 2 + cont_w / 2
    const start_z = -total_d / 2 + cont_d / 2

    const light_refs = useRef<THREE.Mesh[]>([])
    useFrame((state) =>
    {
        const t = state.clock.elapsedTime
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.5)
        for (const l of light_refs.current)
            if (l) (l.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + 1.5 * pulse
    })

    return (
        <group position={[x * s, 0, y * s]}>
            <mesh geometry={base_geo} material={base_mat} position={[0, base_h / 2, 0]} />

            {Array.from({ length: rows }).map((_, rz) => (
                Array.from({ length: cols }).map((_, cx) => {
                    const px = start_x + cx * (cont_w + gap_x)
                    const pz = start_z + rz * (cont_d + gap_z)
                    const idx = rz * cols + cx
                    return (
                        <group key={idx} position={[px, base_h + cont_h / 2, pz]}>
                            <mesh geometry={cont_geo} material={cont_mat} />
                            <mesh geometry={seam_geo} material={seam_mat} position={[0, 0, cont_d / 2 + 0.001]} />
                            <mesh ref={el => (light_refs.current[idx] = el as THREE.Mesh)} geometry={light_geo} material={light_mat} position={[0, cont_h * 0.25, cont_d / 2 + 0.005]} rotation={[Math.PI / 2, 0, 0]} />
                        </group>
                    )
                })
            ))}
        </group>
    )
}
