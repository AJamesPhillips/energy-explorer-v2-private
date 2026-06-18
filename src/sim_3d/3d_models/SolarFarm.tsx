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
    size?: number
}
export function SolarFarms(props: SolarFarmProps)
{
    const { tiles } = props
    if (tiles.length === 0) return null

    return tiles.map(({ x, y }) => (
        <group
            key={`${x}-${y}`}
            position={[x, 0.06, y]}
        >
            <SolarFarmPanels size={props.size} />
        </group>
    ))
}


const TILT = Math.PI / 6
const PANEL_H = BASE_SIZE * 0.28
const LEG_H = BASE_SIZE * 0.08
const BOTTOM_Y = LEG_H
const PANEL_CENTER_Y = LEG_H + (PANEL_H / 2) * Math.cos(TILT)

const OFFSETS: Array<[number, number]> = [
    [-BASE_SIZE * 0.22, -BASE_SIZE * 0.18],
    [ BASE_SIZE * 0.22, -BASE_SIZE * 0.18],
    [-BASE_SIZE * 0.22,  BASE_SIZE * 0.18],
    [ BASE_SIZE * 0.22,  BASE_SIZE * 0.18],
]

/**
 * Shared presentational component for rendering a 2x2 grid of solar panels and
 * frames at the origin.
 * Used by both normal and sinking solar farm components.
 *
 * Props:
 *   size: number (required)
 */
export function SolarFarmPanels({ size = BASE_SIZE, transparent }: { size?: number, transparent?: boolean })
{
    const scale = useMemo(() =>
    {
        return new THREE.Vector3(size / BASE_SIZE, size / BASE_SIZE, size / BASE_SIZE)
    }, [size])

    return <group scale={scale}>
        {OFFSETS.map(([ox, oz], i) => {
            const panel_center_z = oz + (PANEL_H / 2) * Math.sin(TILT)
            return (
                <group key={i} position={[ox, 0, oz]}>
                    {/* Tilted panel */}
                    <mesh
                        geometry={panel_geo}
                        material={transparent ? panel_mat_transparent : panel_mat}
                        position={[0, PANEL_CENTER_Y, panel_center_z - oz]}
                        rotation={[-TILT, 0, 0]}
                    />
                    {/* Horizontal support rail */}
                    <mesh
                        geometry={frame_geo}
                        material={transparent ? frame_mat_transparent: frame_mat}
                        position={[0, BOTTOM_Y, 0]}
                    />
                </group>
            )
        })}
    </group>
}
