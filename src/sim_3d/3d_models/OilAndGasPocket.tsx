import { Text } from "@react-three/drei"
import { useCallback, useEffect, useMemo, useState } from "react"
import * as THREE from "three"

import pub_sub from "../state/pub_sub"


interface OilPocketConfig
{
    x: number
    dy: number
    z: number
    // Scale x
    sx: number
    // Scale y
    sy: number
    // Scale z
    sz: number
}
const OIL_POCKET_CONFIGS: OilPocketConfig[] = [
    { x: -0.50, dy: 0.50, z:  -0.1, sx: 1.9, sy: 0.52, sz: 2.5},
    { x:  0.00, dy: 0.50, z:  -0.3, sx: 1.9, sy: 0.52, sz: 2.5},
    { x: -0.18, dy: 0.85, z: -0.18, sx: 2.5, sy: 0.55, sz: 1.8},
    { x:  0.26, dy: 0.10, z: -0.24, sx: 1.6, sy: 0.45, sz: 2.3},
] as const


interface OilAndGasPocketProps
{
    x: number
    y: number
    cell_size: number
    depth: number
    // total_volume: number
    ratio_remaining: number
}

function OilAndGasPocket({ x, y, depth, ratio_remaining, cell_size }: OilAndGasPocketProps)
{
    const s = cell_size

    const [highlighted_pocket, _set_highlighted_pocket] = useState(null as null | { x: number, y: number })

    const sea_bed_geo   = useMemo(() => new THREE.BoxGeometry(s * 1.5, s * 0.055, s * 1.5), [s])
    const pocket_geo   = useMemo(() => new THREE.SphereGeometry(s * 0.195, 8, 5), [s])

    // ── Materials ──────────────────────────────────────────────────────────
    const sea_bed_mat  = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x8c7a5e, transparent: true, opacity: 0.7 }), [])
    const depleted_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xc1c1c1, transparent: true, opacity: 0.72 }), [])
    const oil_mat      = useMemo(() => new THREE.MeshStandardMaterial({
        color:            0x1b1500,
        // emissive:         new THREE.Color(0x3a1800),
        // emissiveIntensity: 0.35,
        transparent:      true,
        opacity:          0.88,
    }), [])
    const oil_or_depleted_wire_frame_mat = useMemo(() => new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
    }), [])

    useEffect(() => () =>
    {
        for (const g of [sea_bed_geo, pocket_geo]) g.dispose()
        for (const m of [sea_bed_mat, depleted_mat, oil_mat]) m.dispose()
    }, [sea_bed_geo, pocket_geo,
        sea_bed_mat, depleted_mat, oil_mat])


    const highlight_oil_reserves = useCallback((_highlight: boolean) =>
    {
        // return pub_sub.pub("on_highlight_oil_reserves", highlight ? { x, y } : null)
    }, [x, y])

    useEffect(() =>
    {
        // return pub_sub.sub("on_highlight_oil_reserves", _highlighted =>
        // {
        //     // set_highlighted_pocket(highlighted)
        // })
    }, [])


    const any_highlighted = highlighted_pocket !== null
    const this_is_highlighted = highlighted_pocket?.x === x && highlighted_pocket?.y === y


    return (
        <group
            position={[x * s, 0, y * s]}
            onPointerEnter={() => highlight_oil_reserves(true)}
            onClick={() => highlight_oil_reserves(!highlighted_pocket)}
            onPointerLeave={() => highlight_oil_reserves(false)}
        >
            {/* <mesh key="sea_bed" geometry={sea_bed_geo} material={sea_bed_mat}
                position={[0, -1.5 * s, 0]}
            /> */}

            {/* Subsea reservoir pockets: first 2 amber (active) when extracting, rest dark/depleted */}
            {OIL_POCKET_CONFIGS.map(({ x, dy, z, sx, sy, sz }, i) => (
                <mesh
                    key={`pocket-${i}`}
                    geometry={pocket_geo}
                    material={highlighted_pocket
                        ? oil_or_depleted_wire_frame_mat
                        : ratio_remaining > (i / OIL_POCKET_CONFIGS.length) ? oil_mat : depleted_mat
                    }
                    position={[x * s, (-dy -depth) * s, z * s]}
                    scale={[sx, sy, sz]}
                    onClick={e =>
                    {
                        e.stopPropagation()
                        highlight_oil_reserves(!highlighted_pocket)
                    }}
                />
            ))}

            {this_is_highlighted && <mesh
                geometry={new THREE.PlaneGeometry(2 * s, 2 * s)}
                material={new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0.0,
                    side: THREE.DoubleSide,
                })}
                rotation={[0, Math.PI / 4, 0]}
                position={[-1 * s, (-2 -depth) * s, -1 * s]}
                onClick={() =>
                {
                    pub_sub.pub("show_info_and_data_sources", "oil_and_gas_data")
                }}
            />}

            {any_highlighted && <Text
                position={[0, (-1.5 -depth) * s, 0]}
                rotation={[0, Math.PI / 4, 0]}
                fontSize={cell_size * 0.5}
                color="#0077cc"
                anchorX="center"
                anchorY="middle"
                depthOffset={-1}
                // cursor="pointer"
                onClick={() =>
                {
                    pub_sub.pub("show_info_and_data_sources", "oil_and_gas_data")
                }}
            >
                {`Oil & Gas ${Math.round(ratio_remaining * 100)}%`}
            </Text>}

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
        {tiles.map(({ x, y, depth, ratio_remaining }) => {
            return <group key={`${x}-${y}`}>
                <OilAndGasPocket x={x} y={y} depth={depth} ratio_remaining={ratio_remaining} cell_size={cell_size} />
            </group>
        })}
    </>
}
