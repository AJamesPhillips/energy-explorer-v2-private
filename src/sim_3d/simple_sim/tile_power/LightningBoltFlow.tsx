import { useFrame } from "@react-three/fiber"
import { RefObject, useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { LightningBolt } from "../../3d_models/LightningBolt"
import pub_sub from "../../state/pub_sub"
import { clamp, ease_in_quad, ease_out_quad } from "../../utils/clamp"
import { COLOURS, CONSTANTS } from "../constants"


const {
    DEFAULT_SIZE_FOR_TILE_CONTENT: BASE_SIZE,
    ANIMATION: {
        LIGHTNING_BOLT: {
            DURATION_SIM_HOURS,
            DURATION_FADE_SIM_HOURS,
            RISE_HEIGHT_FACTOR,
            GW_HOUR_CHUNKS,
            MAX_INTERVAL_SIM_HOURS,
            MIN_LIGHTNING_BOLT_SCALE,
        }
    },
} = CONSTANTS


interface LightningBoltFlowProps
{
    x: number
    y: number
    // size?: number
    generated_gw: number
    demand_gw: number
}

type BoltPhase = "rising" | "falling" | "fading"
type BoltType = "supply" | "demand"

interface BoltInstance
{
    id: number
    type: BoltType
    phase: BoltPhase
    phase_start_sim_ms: number
    phase_duration_sim_hours: number
    start_y: number
    target_y: number
    offset_x: number
    scale: number
    group_ref: RefObject<THREE.Group | null>
    material: THREE.MeshStandardMaterial
    colour?: THREE.Color
}

export function LightningBoltFlow({ x, y, generated_gw, demand_gw }: LightningBoltFlowProps)
{
    const size = BASE_SIZE
    // local accumulators (GW-hours)
    const generated_accum = useRef<number>(0)
    const demand_accum = useRef<number>(0)
    // times are stored in simulation milliseconds
    const last_generated_spawn = useRef<number>(0)
    const last_demand_spawn = useRef<number>(0)
    const id_counter = useRef<number>(0)
    const bolts_ref = useRef<BoltInstance[]>([])
    // used to trigger mounts/unmounts in React when bolts are added/removed
    const [, set_tick] = useState(0)

    // simulation time (ms) tracking
    const sim_datetime_ms = useRef<number | null>(null)
    const last_sim_datetime_ms = useRef<number | null>(null)

    useEffect(() => pub_sub.sub("simulation_datetime", (payload) =>
    {
        // payload.datetime_ms is in milliseconds
        if (last_sim_datetime_ms.current == null) last_sim_datetime_ms.current = payload.datetime_ms
        sim_datetime_ms.current = payload.datetime_ms
    }, "LightningBoltFlow"), [])

    function spawn_supply(now: number, scale: number)
    {
        const id = ++id_counter.current
        const material = create_material("supply")
        const group_ref = { current: null } as RefObject<THREE.Group | null>
        const target_y = RISE_HEIGHT_FACTOR * size * scale

        const instance: BoltInstance = {
            id,
            type: "supply",
            phase: "rising",
            phase_start_sim_ms: now,
            phase_duration_sim_hours: DURATION_SIM_HOURS,
            start_y: size * scale,
            target_y,
            offset_x: (Math.random()) * size,
            scale,
            group_ref,
            material,
            colour: new THREE.Color(0x44bbff),
        }

        bolts_ref.current.push(instance)
        set_tick(t => t + 1)
        last_generated_spawn.current = now
    }

    function spawn_demand(now: number, scale: number)
    {
        const id = ++id_counter.current
        const material = create_material("demand")
        const group_ref = { current: null } as RefObject<THREE.Group | null>
        const start_y = RISE_HEIGHT_FACTOR * size * scale

        const instance: BoltInstance = {
            id,
            type: "demand",
            phase: "falling",
            phase_start_sim_ms: now,
            phase_duration_sim_hours: DURATION_SIM_HOURS,
            start_y,
            target_y: 0,
            offset_x: (-Math.random()) * size * 0.5,
            scale,
            group_ref,
            material,
            colour: new THREE.Color(0xff4444),
        }

        bolts_ref.current.push(instance)
        set_tick(t => t + 1)
        last_demand_spawn.current = now
    }

    useFrame(() =>
    {
        const now_ms = sim_datetime_ms.current
        if (now_ms == null) return

        const last_sim = last_sim_datetime_ms.current ?? now_ms
        const delta_hours = Math.max(0, (now_ms - last_sim) / 3600000)

        // advance accumulators using simulation time delta
        generated_accum.current += generated_gw * delta_hours
        demand_accum.current += demand_gw * delta_hours

        // supply chunk spawns
        while (generated_accum.current >= GW_HOUR_CHUNKS)
        {
            const scale = clamp(generated_accum.current / GW_HOUR_CHUNKS, MIN_LIGHTNING_BOLT_SCALE, 1)
            spawn_supply(now_ms, scale)
            generated_accum.current -= Math.min(GW_HOUR_CHUNKS, generated_accum.current)
        }

        // spawn due to timeout (ensure visibility even for tiny supply)
        if (generated_accum.current > 0 && (now_ms - last_generated_spawn.current) >= (MAX_INTERVAL_SIM_HOURS * 3600 * 1000))
        {
            const scale = clamp(generated_accum.current / GW_HOUR_CHUNKS, MIN_LIGHTNING_BOLT_SCALE, 1)
            spawn_supply(now_ms, scale)
            generated_accum.current = 0
        }

        // demand chunk spawns
        while (demand_accum.current >= GW_HOUR_CHUNKS)
        {
            const scale = clamp(demand_accum.current / GW_HOUR_CHUNKS, MIN_LIGHTNING_BOLT_SCALE, 1)
            spawn_demand(now_ms, scale)
            demand_accum.current -= Math.min(GW_HOUR_CHUNKS, demand_accum.current)
        }

        if (demand_accum.current > 0 && (now_ms - last_demand_spawn.current) >= (MAX_INTERVAL_SIM_HOURS * 3600 * 1000))
        {
            const scale = clamp(demand_accum.current / GW_HOUR_CHUNKS, MIN_LIGHTNING_BOLT_SCALE, 1)
            spawn_demand(now_ms, scale)
            demand_accum.current = 0
        }

        // animate bolts (mutate three objects directly)
        for (let i = bolts_ref.current.length - 1; i >= 0; i--)
        {
            const b = bolts_ref.current[i]!
            const group = b.group_ref.current
            const elapsed_sim_hours = (now_ms - b.phase_start_sim_ms) / 3600000
            const progress = Math.min(1, elapsed_sim_hours / Math.max(1, b.phase_duration_sim_hours))

            if (b.phase === "rising")
            {
                const yPos = ease_out_quad(progress) * b.target_y
                if (group) group.position.y = yPos
                if (progress >= 1)
                {
                    b.phase = "fading"
                    b.phase_start_sim_ms = now_ms
                    b.phase_duration_sim_hours = DURATION_FADE_SIM_HOURS
                }
            }
            else if (b.phase === "falling")
            {
                const yPos = b.start_y * (1 - ease_in_quad(progress))
                if (group) group.position.y = yPos
                if (progress >= 1)
                {
                    b.phase = "fading"
                    b.phase_start_sim_ms = now_ms
                    b.phase_duration_sim_hours = DURATION_FADE_SIM_HOURS
                }
            }
            else if (b.phase === "fading")
            {
                // const new_opacity = Math.max(0, 1 - progress)
                // b.material.opacity = new_opacity
                // b.material.transparent = true
                // if (progress >= 1)
                // {
                try { b.material.dispose() } catch (e) { /* ignore */ }
                bolts_ref.current.splice(i, 1)
                set_tick(s => s + 1)
                // }
            }
        }

        last_sim_datetime_ms.current = now_ms
    })

    return (
        <group>
            {bolts_ref.current.map(b => (
                <LightningBolt key={b.id} ref={b.group_ref as any} x={x + b.offset_x} y={y} size={size} y_offset={0} scale={b.scale} material={b.material} />
            ))}
        </group>
    )
}


function create_material(type: BoltType)
{
    if (type === "supply")
    {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(COLOURS.generated_electricity),
            emissive: new THREE.Color(COLOURS.generated_electricity_emissive),
            emissiveIntensity: 1.2,
            transparent: true,
            opacity: 1,
        })
    }

    return new THREE.MeshStandardMaterial({
        color: new THREE.Color(COLOURS.demand_electricity),
        emissive: new THREE.Color(COLOURS.demand_electricity_emissive),
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 1,
    })
}
