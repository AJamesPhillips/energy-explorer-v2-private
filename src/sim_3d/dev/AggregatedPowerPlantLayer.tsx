import {
    cellArea,
    cellToBoundary,
    cellToLatLng,
    UNITS,
} from "h3-js"
import { ComponentType, useMemo } from "react"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { AggregatedPowerPlantData } from "../data/power_plants/interface"
import { PowerType } from "../model/interface"
import { clamp } from "../utils/clamp"
import { get_projection, points_to_geometries, XY } from "./projection"



interface AggregatedPowerPlantLayerProps
{
    aggregated_data: Record<string, AggregatedPowerPlantData>
    plant_key: PowerType & ("wind" | "solar" | "nuclear")
    fill_color: number
    outline_color: number
    opacity: number
    min_area_ratio?: number
    RenderPlants: ComponentType<{ tiles: (XY & { h3r4_id: string })[] }>
}

export function AggregatedPowerPlantLayer(props: AggregatedPowerPlantLayerProps)
{
    const {
        aggregated_data,
        plant_key,
        fill_color,
        outline_color,
        opacity,
        min_area_ratio,
        RenderPlants,
    } = props

    const {
        tiles,
        merged_fill,
        merged_outline,
    } = useMemo(() =>
    {
        const projection = get_projection()

        const tiles: (XY & { h3r4_id: string })[] = []
        const fill_geometries: THREE.BufferGeometry[] = []
        const outline_geometries: THREE.BufferGeometry[] = []

        for (const [h3r4_id, data] of Object.entries(aggregated_data))
        {
            const aggregate = data[plant_key]
            if (aggregate.count === 0) continue

            const [lat, lon] = cellToLatLng(h3r4_id)
            const center = projection({ lat, lon })
            if (!center) continue

            const cell_area_km2 = cellArea(h3r4_id, UNITS.km2)
            const plant_area_km2 = aggregate.area_km2 ?? 0
            const area_ratio = clamp(plant_area_km2 / cell_area_km2)
            if (min_area_ratio !== undefined && area_ratio < min_area_ratio) continue

            tiles.push({ ...center, h3r4_id })

            if (area_ratio === 0) continue

            const boundary = cellToBoundary(h3r4_id, false)
            const boundary_points = boundary
                .map(([boundary_lat, boundary_lon]) => projection({ lat: boundary_lat, lon: boundary_lon }))
                .filter((point): point is XY => point !== null)

            if (boundary_points.length < 3) continue

            const radius_scale = Math.sqrt(area_ratio)
            const scaled_points = boundary_points.map(point => new THREE.Vector2(
                center.x + ((point.x - center.x) * radius_scale),
                center.y + ((point.y - center.y) * radius_scale),
            ))

            const geometries = points_to_geometries(scaled_points, 0.08)
            fill_geometries.push(geometries.fill)
            outline_geometries.push(geometries.outline)
        }

        return {
            tiles,
            merged_fill: fill_geometries.length ? mergeGeometries(fill_geometries, true) : null,
            merged_outline: outline_geometries.length ? mergeGeometries(outline_geometries, false) : null,
        }
    }, [aggregated_data, min_area_ratio, plant_key])

    return <>
        <group position={[0, 1.02, 0]}>
            {merged_fill && (
                <mesh geometry={merged_fill}>
                    <meshStandardMaterial color={fill_color} transparent opacity={opacity} side={THREE.DoubleSide} />
                </mesh>
            )}
            {merged_outline && (
                <lineSegments geometry={merged_outline}>
                    <lineBasicMaterial color={outline_color} linewidth={2} />
                </lineSegments>
            )}
        </group>
        <RenderPlants tiles={tiles} />
    </>
}
