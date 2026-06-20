import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { SmokePuffs } from "./SmokePuffs"


type LNGTankerProps = {
    x: number
    y: number
    rotation?: number
    num_domes?: number
    dome_radius?: number
    hull_length?: number
    hull_beam?: number
    hull_colour?: number | string
}

export function LNGTanker({
    x,
    y,
    rotation = Math.PI,
    num_domes = 4,
    dome_radius = 1.2,
    hull_length = 12,
    hull_beam = 3.2,
    hull_colour = 0xd57040,
}: LNGTankerProps)
{
    const dome_positions = useMemo(() => {
        const spacing = hull_length / (num_domes + 1)
        return Array.from({ length: num_domes }, (_, i) => ([
            -hull_length / 2 + spacing * (i + 1),
            dome_radius - (dome_radius * 0.7),
            0,
        ] as [number, number, number]))
    }, [num_domes, dome_radius, hull_length])

    const bridge_pos_x = hull_length / 2 - 1

    const ref = useRef<THREE.Group>(null)
    useFrame(() =>
    {
        // rotate the tanker slowly around its vertical axis
        rotation += 0.005
        ref.current?.setRotationFromEuler(new THREE.Euler(0, rotation, 0))
    })

    return (
        <group ref={ref} position={[x, 0, y]} rotation={[0, rotation, 0]} scale={[1, 1, 1]}>
            {/* Main hull: base and narrower deck to approximate a trapezoid */}
            <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[hull_length, 0.8, hull_beam]} />
                <meshStandardMaterial color={hull_colour} />
            </mesh>

            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[hull_length * 0.86, 0.6, hull_beam * 0.72]} />
                <meshStandardMaterial color={hull_colour} />
            </mesh>

            {/* Pyramid on front for bow */}
            <mesh
                position={[-hull_length / 2 - 0.6, -0.6, 0]}
                rotation={[Math.PI / 4, 0, Math.PI / 2]}
                castShadow receiveShadow>
                <coneGeometry args={[1.4, 1.6, 4]} />
                <meshStandardMaterial color={hull_colour} />
            </mesh>

            {/* Tanks / domes */}
            {dome_positions.map((pos, i) => (
                <mesh key={i} position={pos} castShadow receiveShadow>
                    <sphereGeometry args={[dome_radius, 32, 16]} />
                    <meshStandardMaterial color={0xffffff} roughness={0.6} metalness={0.1} />
                </mesh>
            ))}

            {/* Bridge / superstructure near the stern */}
            <mesh position={[bridge_pos_x, 0.8, 0]} castShadow>
                <boxGeometry args={[2.2, 1.6, 1.8]} />
                <meshStandardMaterial color={0xf1f1f1} />
            </mesh>

            {/* Chimney / funnel */}
            <mesh position={[bridge_pos_x + 0.4, 1.8, -0.4]} castShadow>
                <cylinderGeometry args={[0.18, 0.22, 1.0, 12]} />
                <meshStandardMaterial color={0x222222} />
            </mesh>

            {/* Optional smoke */}
            <SmokePuffs
                position={[bridge_pos_x + 0.4, 2.25, -0.4]}
                color={0x666666}
                puff_radius={0.18}
                rise_height={2.2}
                num_puffs={3}
                active={true}
            />
        </group>
    )
}
