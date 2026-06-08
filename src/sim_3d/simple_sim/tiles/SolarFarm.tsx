import { useEffect, useMemo } from "react"
import * as THREE from "three"


let panel_geo: THREE.PlaneGeometry
let panel_mat: THREE.MeshStandardMaterial
let panel_mat_transparent: THREE.MeshStandardMaterial
let frame_geo: THREE.BoxGeometry
let frame_mat: THREE.MeshStandardMaterial
let frame_mat_transparent: THREE.MeshStandardMaterial

export function SolarFarmsInit({ cell_size }: { cell_size: number })
{
    const result = useMemo(() => {
        const pw = cell_size * 0.38
        const ph = cell_size * 0.28

        const panel_mat_args = { color: 0x1a2e6e, side: THREE.FrontSide }
        const frame_mat_args = { color: 0x888888 }

        return {
            panel_geo: new THREE.PlaneGeometry(pw, ph),
            panel_mat: new THREE.MeshStandardMaterial(panel_mat_args),
            panel_mat_transparent: new THREE.MeshStandardMaterial({ ...panel_mat_args, transparent: true }),
            frame_geo: new THREE.BoxGeometry(pw + cell_size * 0.03, cell_size * 0.015, cell_size * 0.015),
            frame_mat: new THREE.MeshStandardMaterial(frame_mat_args),
            frame_mat_transparent: new THREE.MeshStandardMaterial({ ...frame_mat_args, transparent: true }),
        }
    }, [cell_size])

    panel_geo = result.panel_geo
    panel_mat = result.panel_mat
    panel_mat_transparent = result.panel_mat_transparent
    frame_geo = result.frame_geo
    frame_mat = result.frame_mat
    frame_mat_transparent = result.frame_mat_transparent

    // Dispose geometry/materials on unmount
    useEffect(() => () => {
        panel_geo.dispose()
        panel_mat.dispose()
        panel_mat_transparent.dispose()
        frame_geo.dispose()
        frame_mat.dispose()
        frame_mat_transparent.dispose()
    }, [panel_geo, panel_mat, panel_mat_transparent, frame_geo, frame_mat, frame_mat_transparent])

    return null
}


interface SolarFarmProps
{
    tiles: Array<{ x: number, y: number }>
    cell_size?: number
    size?: number
}
export function SolarFarms(props: SolarFarmProps)
{
    const { tiles, cell_size = 1 } = props
    if (tiles.length === 0) return null
    const { size = cell_size } = props

    const tile_top_y = cell_size * 0.06
    return tiles.map(({ x, y }) => (
        <group
            key={`${x}-${y}`}
            position={[x * cell_size, tile_top_y, y * cell_size]}
        >
            <SolarFarmPanels size={size} />
        </group>
    ))
}


/**
 * Shared presentational component for rendering a 2x2 grid of solar panels and
 * frames at the origin.
 * Used by both normal and sinking solar farm components.
 *
 * Props:
 *   size: number (required)
 */
export function SolarFarmPanels({ size, transparent }: { size: number, transparent?: boolean })
{
    const tilt = Math.PI / 6
    const panel_h = size * 0.28
    const leg_h = size * 0.08

    const offsets: Array<[number, number]> = [
        [-size * 0.22, -size * 0.18],
        [ size * 0.22, -size * 0.18],
        [-size * 0.22,  size * 0.18],
        [ size * 0.22,  size * 0.18],
    ]

    return <>
        {offsets.map(([ox, oz], i) => {
            const bottom_y = leg_h
            const panel_center_y = bottom_y + (panel_h / 2) * Math.cos(tilt)
            const panel_center_z = oz + (panel_h / 2) * Math.sin(tilt)
            return (
                <group key={i} position={[ox, 0, oz]}>
                    {/* Tilted panel */}
                    <mesh
                        geometry={panel_geo}
                        material={transparent ? panel_mat_transparent : panel_mat}
                        position={[0, panel_center_y, panel_center_z - oz]}
                        rotation={[-tilt, 0, 0]}
                    />
                    {/* Horizontal support rail */}
                    <mesh
                        geometry={frame_geo}
                        material={transparent ? frame_mat_transparent: frame_mat}
                        position={[0, bottom_y, 0]}
                    />
                </group>
            )
        })}
    </>
}
