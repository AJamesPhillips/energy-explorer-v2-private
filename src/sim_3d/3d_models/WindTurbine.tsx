import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"



const geo_mats = {
    tower_geo: undefined as THREE.CylinderGeometry | undefined,
    tower_mat: undefined as THREE.MeshStandardMaterial | undefined,
    tower_mat_transparent: undefined as THREE.MeshStandardMaterial | undefined,
    nacelle_geo: undefined as THREE.BoxGeometry | undefined,
    nacelle_mat: undefined as THREE.MeshStandardMaterial | undefined,
    nacelle_mat_transparent: undefined as THREE.MeshStandardMaterial | undefined,
    blade_geo: undefined as THREE.ConeGeometry | undefined,
    blade_mat: undefined as THREE.MeshStandardMaterial | undefined,
    blade_mat_transparent: undefined as THREE.MeshStandardMaterial | undefined,
}

function wind_turbine_init(cell_size: number)
{
    const result = useMemo(() =>
    {
        const { tower_height, blade_length } = get_dimensions(cell_size)

        return {
            tower_geo: new THREE.CylinderGeometry(cell_size * 0.02, cell_size * 0.04, tower_height, 6),
            tower_mat: new THREE.MeshStandardMaterial({ color: 0xdddddd }),
            tower_mat_transparent: new THREE.MeshStandardMaterial({ color: 0xdddddd, transparent: true }),
            nacelle_geo: new THREE.BoxGeometry(cell_size * 0.14, cell_size * 0.07, cell_size * 0.07),
            nacelle_mat: new THREE.MeshStandardMaterial({ color: 0xcccccc }),
            nacelle_mat_transparent: new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true }),
            blade_geo: new THREE.ConeGeometry(cell_size * 0.035, blade_length, 4),
            blade_mat: new THREE.MeshStandardMaterial({ color: 0xfafafa }),
            blade_mat_transparent: new THREE.MeshStandardMaterial({ color: 0xfafafa, transparent: true }),
        }
    }, [cell_size])


    geo_mats.tower_geo = result.tower_geo
    geo_mats.tower_mat = result.tower_mat
    geo_mats.tower_mat_transparent = result.tower_mat_transparent
    geo_mats.nacelle_geo = result.nacelle_geo
    geo_mats.nacelle_mat = result.nacelle_mat
    geo_mats.nacelle_mat_transparent = result.nacelle_mat_transparent
    geo_mats.blade_geo = result.blade_geo
    geo_mats.blade_mat = result.blade_mat
    geo_mats.blade_mat_transparent = result.blade_mat_transparent


    useEffect(() => () =>
    {
        geo_mats.tower_geo?.dispose()
        geo_mats.tower_mat?.dispose()
        geo_mats.tower_mat_transparent?.dispose()
        geo_mats.nacelle_geo?.dispose()
        geo_mats.nacelle_mat?.dispose()
        geo_mats.nacelle_mat_transparent?.dispose()
        geo_mats.blade_geo?.dispose()
        geo_mats.blade_mat?.dispose()
        geo_mats.blade_mat_transparent?.dispose()
    }, Object.values(geo_mats))
}

function get_dimensions(cell_size: number)
{
    const tower_height = cell_size * 0.9
    const blade_length = cell_size * 0.55
    return { tower_height, blade_length }
}



export interface WindTurbineFarmsProps
{
    tiles: { x: number, y: number }[]
    cell_size?: number
    size?: number
}
export function WindTurbineFarms(props: WindTurbineFarmsProps)
{
    const { tiles, cell_size = 1 } = props
    if (tiles.length === 0) return null
    const { size = cell_size } = props

    return <>
        {tiles.map(({ x, y }, i) => (
            <group
                key={`${x}-${y}`}
                position={[x * cell_size, 0, y * cell_size]}
            >
                <WindTurbine size={size} index={i} />
            </group>
        ))}
    </>
}


export function WindTurbine({ size, index, transparent }: { size: number, index?: number, transparent?: boolean })
{
    const { tower_height, blade_length } = get_dimensions(size)

    const rotor_refs = useRef<(THREE.Group | null)[]>([])

    useFrame((_state, delta) =>
    {
        const d = delta * 2.0
        rotor_refs.current.forEach(ref =>
        {
            if (ref) ref.rotation.x += d
        })
    })

    wind_turbine_init(size)

    return <>
        {/* Tower */}
        <mesh
            geometry={geo_mats.tower_geo}
            material={transparent ? geo_mats.tower_mat_transparent : geo_mats.tower_mat}
            position={[0, tower_height / 2, 0]}
        />
        {/* Nacelle + rotor at tower top */}
        <group position={[0, tower_height, 0]}>
            {/* Nacelle body — offset slightly so rotor sits at its front face */}
            <mesh
                geometry={geo_mats.nacelle_geo}
                material={transparent ? geo_mats.nacelle_mat_transparent : geo_mats.nacelle_mat}
                position={[size * 0.05, 0, 0]}
            />
            {/* Rotor disc — blades rotate around X axis (turbine faces +X) */}
            <group ref={el => {
                rotor_refs.current[index ?? 0] = el
            }}>
                {[0, 1, 2].map(bi => (
                    <group
                        key={bi}
                        rotation={[bi * Math.PI * 2 / 3, 0, 0]}
                    >
                        <mesh
                            geometry={geo_mats.blade_geo}
                            material={transparent ? geo_mats.blade_mat_transparent : geo_mats.blade_mat}
                            position={[0, blade_length / 2, 0]}
                        />
                    </group>
                ))}
            </group>
        </group>
    </>
}
