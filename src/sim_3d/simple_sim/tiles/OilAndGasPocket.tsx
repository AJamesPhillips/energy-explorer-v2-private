import { useEffect, useMemo } from "react"
import * as THREE from "three"


interface OilPocketConfig
{
    x: number
    depth: number
    z: number
    // Scale x
    sx: number
    // Scale y
    sy: number
    // Scale z
    sz: number
}
const OIL_POCKET_CONFIGS: OilPocketConfig[] = [
    { x: -0.50, depth: 2.50, z:  -0.1, sx: 1.9, sy: 0.52, sz: 2.5},
    { x:  0.00, depth: 2.50, z:  -0.3, sx: 1.9, sy: 0.52, sz: 2.5},
    { x: -0.18, depth: 1.85, z: -0.18, sx: 2.5, sy: 0.55, sz: 1.8},
    { x:  0.26, depth: 2.10, z: -0.24, sx: 1.6, sy: 0.45, sz: 2.3},
] as const


interface OilAndGasPocketProps
{
    x: number
    y: number
    cell_size: number
    // depth: number
    // total_volume: number
    ratio_remaining: number
}

function OilAndGasPocket({ x, y, cell_size, ratio_remaining }: OilAndGasPocketProps)
{
    const s = cell_size

    const sea_bed_geo   = useMemo(() => new THREE.BoxGeometry(s * 1.5, s * 0.055, s * 1.5), [s])
    const pocket_geo   = useMemo(() => new THREE.SphereGeometry(s * 0.195, 8, 5), [s])

    // ── Materials ──────────────────────────────────────────────────────────
    const sea_bed_mat  = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x8c7a5e, transparent: true, opacity: 0.7 }), [])
    const depleted_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xc1c1c1, transparent: true, opacity: 0.72 }), [])
    const oil_mat      = useMemo(() => new THREE.MeshStandardMaterial({
        color:            0x1b1500,
        // emissive:         new THREE.Color(0x3a1800),
        // emissiveIntensity: 0.35,
        // transparent:      true,
        // opacity:          0.88,
    }), [])

    useEffect(() => () =>
    {
        for (const g of [sea_bed_geo, pocket_geo]) g.dispose()
        for (const m of [sea_bed_mat, depleted_mat, oil_mat]) m.dispose()
    }, [sea_bed_geo, pocket_geo,
        sea_bed_mat, depleted_mat, oil_mat])

    return (
        <group position={[x * s, 0, y * s]}>
            <mesh key="sea_bed" geometry={sea_bed_geo} material={sea_bed_mat}
                position={[0, -1.5 * s, 0]}
            />

            {/* Subsea reservoir pockets: first 2 amber (active) when extracting, rest dark/depleted */}
            {OIL_POCKET_CONFIGS.map(({ x, depth, z, sx, sy, sz }, i) => (
                <mesh
                    key={`pocket-${i}`}
                    geometry={pocket_geo}
                    material={ratio_remaining > (i / OIL_POCKET_CONFIGS.length) ? oil_mat : depleted_mat}
                    position={[x * s, -depth * s, z * s]}
                    scale={[sx, sy, sz]}
                />
            ))}

        </group>
    )
}


interface OilAndGasPocketTilesProps
{
    tiles: Omit<OilAndGasPocketProps, "cell_size">[]
    cell_size: number
}

export function OilAndGasPocketTiles({ tiles, cell_size }: OilAndGasPocketTilesProps)
{
    if (tiles.length === 0) return null

    return <>
        {tiles.map(({ x, y, ratio_remaining }) => {
            return <group key={`${x}-${y}`}>
                <OilAndGasPocket x={x} y={y} cell_size={cell_size} ratio_remaining={ratio_remaining} />
            </group>
        })}
    </>
}
