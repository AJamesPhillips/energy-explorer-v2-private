import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import pub_sub from "../state/pub_sub"



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

const BASE_SIZE = 12
const TOWER_HEIGHT = BASE_SIZE * 0.9
const BLADE_LENGTH = BASE_SIZE * 0.55

export function WindTurbineInit()
{
    useEffect(() =>
    {
        geo_mats.tower_geo = new THREE.CylinderGeometry(BASE_SIZE * 0.02, BASE_SIZE * 0.04, TOWER_HEIGHT, 6)
        geo_mats.tower_mat = new THREE.MeshStandardMaterial({ color: 0xdddddd })
        geo_mats.tower_mat_transparent = new THREE.MeshStandardMaterial({ color: 0xdddddd, transparent: true })
        geo_mats.nacelle_geo = new THREE.BoxGeometry(BASE_SIZE * 0.14, BASE_SIZE * 0.07, BASE_SIZE * 0.07)
        geo_mats.nacelle_mat = new THREE.MeshStandardMaterial({ color: 0xcccccc })
        geo_mats.nacelle_mat_transparent = new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true })
        geo_mats.blade_geo = new THREE.ConeGeometry(BASE_SIZE * 0.035, BLADE_LENGTH, 4)
        geo_mats.blade_mat = new THREE.MeshStandardMaterial({ color: 0xfafafa })
        geo_mats.blade_mat_transparent = new THREE.MeshStandardMaterial({ color: 0xfafafa, transparent: true })

        return () =>
        {
            Object.values(geo_mats).forEach(gm => gm?.dispose())
        }
    }, Object.values(geo_mats))

    return null
}



export interface WindTurbineFarmsProps
{
    tiles: { h3r4_id: string, x: number, y: number }[]
    size?: number
}
export function WindTurbineFarms(props: WindTurbineFarmsProps)
{
    const { tiles } = props
    if (tiles.length === 0) return null
    const { size } = props

    return <>
        {tiles.map(({ x, y, h3r4_id }, i) => (
            <group
                key={h3r4_id}
                position={[x, 0, y]}
            >
                <WindTurbine size={size} index={i} h3r4_id={h3r4_id} />
            </group>
        ))}
    </>
}


const BASE_SPEED = 6
export function WindTurbine({ size = BASE_SIZE, index, transparent, h3r4_id }: { size?: number, index?: number, transparent?: boolean, h3r4_id?: string })
{
    const rotor_refs = useRef<(THREE.Group | null)[]>([])
    const speed = useRef(BASE_SPEED)
    const sim_speed_factor = useRef(1)

    useFrame((_state, delta) =>
    {
        const d = delta * speed.current * sim_speed_factor.current
        rotor_refs.current.forEach(ref =>
        {
            if (ref) ref.rotation.x += d
        })
    })

    useEffect(() =>
    {
        if (!h3r4_id) return

        return pub_sub.sub("power_supply_and_demand", ({ gen_cap_store_MW_by_h3r4 }) =>
        {
            const generation = gen_cap_store_MW_by_h3r4[h3r4_id]
            if (!generation) return
            const new_speed = (generation.wind.generated_MW / generation.wind.capacity_MW) * BASE_SPEED
            speed.current = new_speed
        })
    }, [])

    useEffect(() => pub_sub.sub("simulation_speed_changed", ({ factor }) =>
    {
        sim_speed_factor.current = Math.min(factor, 1)
    }, "WindTurbine"), [])

    const scale = useMemo(() => new THREE.Vector3(size / BASE_SIZE, size / BASE_SIZE, size / BASE_SIZE), [size])

    return <group scale={scale}>
        {/* Tower */}
        <mesh
            geometry={geo_mats.tower_geo}
            material={transparent ? geo_mats.tower_mat_transparent : geo_mats.tower_mat}
            position={[0, TOWER_HEIGHT / 2, 0]}
        />
        {/* Nacelle + rotor at tower top */}
        <group position={[0, TOWER_HEIGHT, 0]}>
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
                            position={[0, BLADE_LENGTH / 2, 0]}
                        />
                    </group>
                ))}
            </group>
        </group>
    </group>
}
