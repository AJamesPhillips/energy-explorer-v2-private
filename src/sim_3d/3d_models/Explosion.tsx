import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { SmokePuffs } from "./SmokePuffs"

type ExplosionProps = {
    x: number
    y: number
    /** overall scale multiplier (default: 1.5 = large) */
    scale?: number
    /** if false, the explosion will not animate */
    active?: boolean
}

export function Explosion({ x: x_pos, y, scale = 1.5, active = true }: ExplosionProps)
{
    const groupRef = useRef<THREE.Group | null>(null)
    const pointsRef = useRef<THREE.Points | null>(null)
    const lightRef = useRef<THREE.PointLight | null>(null)

    // particle counts scale with requested size
    const fireCount = Math.max(60, Math.floor(180 * scale))

    // Buffers for positions & colours (shared with the BufferAttribute)
    const positions = useMemo(() => new Float32Array(fireCount * 3), [fireCount])
    const colors = useMemo(() => new Float32Array(fireCount * 3), [fireCount])

    // Per-particle velocities and lifetimes (kept out-of-band)
    const velocities = useMemo(() => new Float32Array(fireCount * 3), [fireCount])
    const lifetimes = useMemo(() => new Float32Array(fireCount), [fireCount])
    const ages = useRef(new Float32Array(fireCount))

    // Points material for the fiery core (additive blending)
    const pointsMat = useMemo(() => new THREE.PointsMaterial({
        size: 0.9 * Math.max(0.6, scale),
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    }), [scale])

    // initialise particle data
    useEffect(() =>
    {
        for (let i = 0; i < fireCount; i++)
        {
            // start near the origin with a slight random offset
            positions[3 * i + 0] = (Math.random() - 0.5) * 0.12 * scale
            positions[3 * i + 1] = (Math.random() - 0.2) * 0.06 * scale
            positions[3 * i + 2] = (Math.random() - 0.5) * 0.12 * scale

            // outward + upward velocity
            const dir = new THREE.Vector3((Math.random() * 2 - 1), Math.random() * 1.6 + 0.6, (Math.random() * 2 - 1)).normalize()
            const speed = (2 + Math.random() * 6) * scale
            velocities[3 * i + 0] = dir.x * speed
            velocities[3 * i + 1] = dir.y * speed
            velocities[3 * i + 2] = dir.z * speed

            lifetimes[i] = 0.7 + Math.random() * 1.2
            ages.current[i] = Math.random() * lifetimes[i]

            // fire colours (yellow -> orange)
            const c = new THREE.Color()
            c.setHSL(0.06 + Math.random() * 0.06, 1.0, 0.45 + Math.random() * 0.2)
            colors[3 * i + 0] = c.r
            colors[3 * i + 1] = c.g
            colors[3 * i + 2] = c.b
        }

        return () =>
        {
            pointsMat.dispose()
        }
    }, [fireCount, positions, velocities, lifetimes, colors, pointsMat, scale])

    // Animation: move fire particles outward and fade the core; spawn-time is recorded on first frame
    const startTime = useRef<number | null>(null)
    useFrame((state, delta) =>
    {
        if (!active) return
        if (!pointsRef.current) return

        if (startTime.current === null) startTime.current = state.clock.elapsedTime
        const t = state.clock.elapsedTime - startTime.current

        const fireDuration = 1.6 * scale
        const fadeTime = 1.0 * scale

        const geo = pointsRef.current.geometry as THREE.BufferGeometry
        const posAttr = geo.attributes.position as THREE.BufferAttribute

        // simple physics: apply velocity, slight downward gravity on Y
        const gravity = -3.0 * scale
        for (let i = 0; i < fireCount; i++)
        {
            const idx3 = 3 * i
            if (ages.current[i] > lifetimes[i]) continue
            ages.current[i] += delta

            positions[idx3 + 0] += velocities[idx3 + 0] * delta
            positions[idx3 + 1] += velocities[idx3 + 1] * delta + 0.5 * gravity * delta * delta
            positions[idx3 + 2] += velocities[idx3 + 2] * delta
        }

        posAttr.needsUpdate = true

        // fade material after the main burst
        if (t > fireDuration)
        {
            const fade = Math.max(0, 1 - (t - fireDuration) / fadeTime)
            pointsMat.opacity = fade
            if (lightRef.current) lightRef.current.intensity = 6 * scale * fade
            if (fade <= 0.01) pointsRef.current.visible = false
        }
        else
        {
            // flashy light at burst
            if (lightRef.current) lightRef.current.intensity = 6 * scale * (1 - (t / fireDuration) * 0.6)
        }
    })

    // Smoke lives a bit longer and rises; reuse SmokePuffs for a soft, drifting smoke
    const smoke_offset_y = 0.15 * scale

    return (
        <group ref={groupRef} position={[x_pos, 0, y]} scale={[1, 1, 1]}>

            {/* fiery particle core */}
            <points ref={pointsRef} position={[0, smoke_offset_y, 0]}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                </bufferGeometry>
                <primitive object={pointsMat} attach="material" />
            </points>

            {/* flash light */}
            <pointLight ref={lightRef} color={0xffaa66} intensity={6 * scale} distance={8 * scale} decay={2} position={[0, 1 * scale, 0]} />

            {/* billowy smoke puffs rising from the same origin */}
            <SmokePuffs
                position={[0, smoke_offset_y * 0.4, 0]}
                color={0x333333}
                puff_radius={0.45 * scale}
                rise_height={5 * scale}
                num_puffs={8}
                active={true}
            />

        </group>
    )
}
