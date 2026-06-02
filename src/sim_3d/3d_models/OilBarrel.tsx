import { useEffect, useMemo } from "react"
import * as THREE from "three"


export type FuelType = "crude" | "diesel" | "heating_fuel" | "jet_fuel" | "petrol" | "natural_gas"

const FUEL_COLORS: Record<FuelType, string> = {
    crude:        "#1a1a1a",
    diesel:       "#4f371f",
    heating_fuel: "#85573e",
    jet_fuel:     "#c8b45a",
    petrol:       "#e8dfa0",
    natural_gas:  "#2266ee",
}

const METAL_COLOR = "#7a7a7a"


interface OilBarrelProps
{
    x: number
    y: number
    cell_size: number
    fuel_type: FuelType
}

export function OilBarrel({ x, y, cell_size, fuel_type }: OilBarrelProps)
{
    const s = cell_size

    // ── Dimensions ─────────────────────────────────────────────────────────
    const body_r   = s * 0.09
    const body_h   = s * 0.22
    const rim_r    = s * 0.095
    const rim_h    = s * 0.010
    const band_r   = s * 0.093
    const band_h   = s * 0.014
    const bung_r   = s * 0.015
    const bung_h   = s * 0.018
    const bung_off = s * 0.045   // radial offset from barrel centre on the top cap

    // ── Geometries ─────────────────────────────────────────────────────────
    const body_geo  = useMemo(() => new THREE.CylinderGeometry(body_r, body_r, body_h, 14), [body_r, body_h])
    const rim_geo   = useMemo(() => new THREE.CylinderGeometry(rim_r, rim_r, rim_h, 14), [rim_r, rim_h])
    const band_geo  = useMemo(() => new THREE.CylinderGeometry(band_r, band_r, band_h, 14), [band_r, band_h])
    const bung_geo  = useMemo(() => new THREE.CylinderGeometry(bung_r, bung_r, bung_h, 8), [bung_r, bung_h])

    // ── Materials ──────────────────────────────────────────────────────────
    const body_mat  = useMemo(() => new THREE.MeshStandardMaterial({
        color:     FUEL_COLORS[fuel_type],
        roughness: 0.6,
        metalness: 0.2,
    }), [fuel_type])

    const metal_mat = useMemo(() => new THREE.MeshStandardMaterial({
        color:     METAL_COLOR,
        roughness: 0.5,
        metalness: 0.6,
    }), [])

    useEffect(() => () =>
    {
        body_geo.dispose()
        rim_geo.dispose()
        band_geo.dispose()
        bung_geo.dispose()
        body_mat.dispose()
        metal_mat.dispose()
    }, [body_geo, rim_geo, band_geo, bung_geo, body_mat, metal_mat])

    // Barrel sits on the grid: bottom rim at y = 0
    const centre_y = body_h / 2

    return (
        <group position={[x * s, 0, y * s]}>

            {/* Main barrel body */}
            <mesh geometry={body_geo} material={body_mat} position={[0, centre_y, 0]} />

            {/* Top rim */}
            <mesh geometry={rim_geo} material={metal_mat} position={[0, body_h - rim_h / 2 + 0.01, 0]} />

            {/* Bottom rim */}
            <mesh geometry={rim_geo} material={metal_mat} position={[0, rim_h / 2 - 0.01, 0]} />

            {/* Metal bands — upper, middle, lower */}
            <mesh geometry={band_geo} material={metal_mat} position={[0, centre_y + body_h * 0.22, 0]} />
            <mesh geometry={band_geo} material={metal_mat} position={[0, centre_y,                  0]} />
            <mesh geometry={band_geo} material={metal_mat} position={[0, centre_y - body_h * 0.22, 0]} />

            {/* Top bung plug */}
            <mesh geometry={bung_geo} material={metal_mat} position={[bung_off, body_h + bung_h / 2, 0]} />

        </group>
    )
}
