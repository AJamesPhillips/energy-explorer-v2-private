import { useEffect, useMemo } from "react"
import * as THREE from "three"


let panel_geo: THREE.PlaneGeometry
let panel_mat: THREE.MeshStandardMaterial
let panel_mat_transparent: THREE.MeshStandardMaterial
let frame_geo: THREE.BoxGeometry
let frame_mat: THREE.MeshStandardMaterial
let frame_mat_transparent: THREE.MeshStandardMaterial

const BASE_SIZE = 7
export function SolarFarmsInit()
{
    useEffect(() =>
    {
        const pw = BASE_SIZE * 0.38
        const ph = BASE_SIZE * 0.28

        const panel_mat_args = { color: 0x1a2e6e, side: THREE.FrontSide }
        const frame_mat_args = { color: 0x888888 }

        panel_geo = new THREE.PlaneGeometry(pw, ph)
        panel_mat = new THREE.MeshStandardMaterial(panel_mat_args)
        panel_mat_transparent = new THREE.MeshStandardMaterial({ ...panel_mat_args, transparent: true })
        frame_geo = new THREE.BoxGeometry(pw + BASE_SIZE * 0.03, BASE_SIZE * 0.015, BASE_SIZE * 0.015)
        frame_mat = new THREE.MeshStandardMaterial(frame_mat_args)
        frame_mat_transparent = new THREE.MeshStandardMaterial({ ...frame_mat_args, transparent: true })

        // Dispose geometry/materials on unmount
        return () => {
            panel_geo.dispose()
            panel_mat.dispose()
            panel_mat_transparent.dispose()
            frame_geo.dispose()
            frame_mat.dispose()
            frame_mat_transparent.dispose()
        }
    }, [])

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

    const tile_top_y = cell_size * 0.06
    return tiles.map(({ x, y }) => (
        <group
            key={`${x}-${y}`}
            position={[x * cell_size, tile_top_y, y * cell_size]}
        >
            <SolarFarmPanels />
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
export function SolarFarmPanels({ size = 7, transparent }: { size?: number, transparent?: boolean })
{
    const tilt = Math.PI / 6
    const panel_h = BASE_SIZE * 0.28
    const leg_h = BASE_SIZE * 0.08

    const offsets: Array<[number, number]> = [
        [-BASE_SIZE * 0.22, -BASE_SIZE * 0.18],
        [ BASE_SIZE * 0.22, -BASE_SIZE * 0.18],
        [-BASE_SIZE * 0.22,  BASE_SIZE * 0.18],
        [ BASE_SIZE * 0.22,  BASE_SIZE * 0.18],
    ]

    const scale = useMemo(() =>
    {
        return new THREE.Vector3(size / BASE_SIZE, size / BASE_SIZE, size / BASE_SIZE)
    }, [size])

    return <group scale={scale}>
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
    </group>
}
