import { useTexture } from "@react-three/drei"
import { useEffect, useMemo } from "react"
import * as THREE from "three"

import { deg_to_rad } from "../../utils/angle"
import { XY } from "../dev/projection"
import { SmokePuffs } from "./SmokePuffs"


const BASE_SIZE = 8

interface NuclearPlantProps
{
    x: number
    y: number
}

export function NuclearPlant({ x, y }: NuclearPlantProps)
{
    const size = BASE_SIZE

    // ── Containment base + dome ───────────────────────────────────────
    const base_height = size * 0.08
    const base_radius = size * 0.18
    const base_geo = useMemo(() => new THREE.CylinderGeometry(base_radius, base_radius, base_height, 20), [base_radius, base_height])
    const base_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xdddddd }), [])

    const dome_radius = size * 0.18
    const dome_geo = useMemo(() => new THREE.SphereGeometry(dome_radius, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), [dome_radius])
    const dome_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xdedede }), [])

    // ── Nuclear symbol (SVG texture on a plane) ────────────────────────
    const nuclear_tex = useTexture("./svgs/nuclear.svg") as THREE.Texture
    const symbol_size = size * 0.18
    const symbol_geo = useMemo(() => new THREE.PlaneGeometry(symbol_size, symbol_size), [symbol_size])
    const nuclear_mat = useMemo(() => new THREE.MeshBasicMaterial({ map: nuclear_tex, transparent: true, alphaTest: 0.05 }), [nuclear_tex])

    // ── Turbine hall ──────────────────────────────────────────────────
    const hall_geo = useMemo(() => new THREE.BoxGeometry(size * 0.45, size * 0.10, size * 0.18), [size])
    const hall_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x8899aa }), [])

    const geo_mat_tex = [
        base_geo, dome_geo, symbol_geo, hall_geo,
        base_mat, dome_mat, nuclear_mat, hall_mat, nuclear_tex
    ]

    useEffect(() => () =>
    {
        geo_mat_tex.forEach(g => g.dispose())
    }, geo_mat_tex)

    // ── Layout / positions ────────────────────────────────────────────
    const base_center_y = base_height / 2
    const dome_center_y = base_height + dome_radius * 0.2
    const dome_z = size * 0.15

    const hall_y = base_center_y

    const symbol_angle = deg_to_rad(45)
    const symbol_pos_z = dome_z + dome_radius * Math.cos(symbol_angle)
    const symbol_pos_x = dome_z + dome_radius * Math.sin(symbol_angle)
    const symbol_pos_y = dome_center_y + dome_radius * 0.12

    return (
        <group position={[x, 0, y]}>
            {/* containment base + dome */}
            <mesh geometry={base_geo} material={base_mat} position={[size * 0.15, base_center_y, dome_z]} />
            <mesh geometry={dome_geo} material={dome_mat} position={[size * 0.15, dome_center_y, dome_z]} />

            {/* nuclear symbol plane (facing +Z) */}
            <mesh geometry={symbol_geo} material={nuclear_mat} position={[symbol_pos_x, symbol_pos_y, symbol_pos_z]} rotation={[0, symbol_angle, 0]} />

            {/* turbine / auxiliary hall */}
            <mesh geometry={hall_geo} material={hall_mat} position={[-size * 0.2, hall_y, size * 0.18]} />

            <CoolingTower x={-1} cell_size={size} />
            <CoolingTower x={1} cell_size={size} />
        </group>
    )
}


function CoolingTower({ x, cell_size }: { x: number, cell_size: number })
{
    const s = cell_size
    const tower_x = x * s * 0.30

    // ── Cooling towers dimensions ──────────────────────────────────────
    const tower_lower_h = s * 0.34
    const tower_upper_h = s * 0.14

    const tower_lower_BottomR = s * 0.20
    const tower_lower_TopR = s * 0.12
    const tower_upper_BottomR = s * 0.12
    const tower_upper_TopR = s * 0.14

    const tower_lower_Geo = useMemo(() => new THREE.CylinderGeometry(tower_lower_TopR, tower_lower_BottomR, tower_lower_h, 16), [tower_lower_TopR, tower_lower_BottomR, tower_lower_h])
    const tower_upper_Geo = useMemo(() => new THREE.CylinderGeometry(tower_upper_TopR, tower_upper_BottomR, tower_upper_h, 16), [tower_upper_TopR, tower_upper_BottomR, tower_upper_h])
    const tower_mat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xcccccc }), [])

    const geo_mat = [ tower_lower_Geo, tower_upper_Geo, tower_mat ]

    useEffect(() => () =>
    {
        geo_mat.forEach(g => g.dispose())
    }, geo_mat)

    // ── Layout / positions ────────────────────────────────────────────
    const tower_z = -s * 0.25
    const lower_center_y = tower_lower_h / 2
    const upper_center_y = lower_center_y + tower_lower_h / 2 + tower_upper_h / 2
    const tower_top_y = upper_center_y + tower_upper_h / 2

    return <>
        <mesh geometry={tower_lower_Geo} material={tower_mat} position={[ tower_x, lower_center_y, tower_z]} />
        <mesh geometry={tower_upper_Geo} material={tower_mat} position={[ tower_x, upper_center_y, tower_z]} />

        <SmokePuffs
            position={[ tower_x, tower_top_y + s * -0.02, tower_z]}
            color={0xfafafa}
            puff_radius={s * 0.06}
            rise_height={s * 0.4}
            active={true}
            num_puffs={7}
        />
    </>
}


export function NuclearPlants({ tiles }: { tiles: (XY & { h3r4_id: string })[] })
{
    return <>
        {tiles.map(tile => (
            <NuclearPlant key={tile.h3r4_id} x={tile.x} y={tile.y} />
        ))}
    </>
}
