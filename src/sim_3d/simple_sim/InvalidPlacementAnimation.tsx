import { useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { BuildingActionTypeString } from "../../state/building_action/interface"
import { asset_url } from "../../utils/asset_url"
import { SolarFarmPanels } from "../3d_models/SolarFarm"
import { WindTurbine } from "../3d_models/WindTurbine"
import pub_sub from "../state/pub_sub"
import { CellDataV1 } from "./interface"

const bubbles_audio_url = asset_url("/audio/bubbles.mp3")


interface SinkingEntry
{
    id: number
    tile: CellDataV1
    item_type: BuildingActionTypeString
}

const SINK_DURATION_S = 2.0

export function InvalidPlacementAnimations({ cell_size }: { cell_size: number })
{
    const [entries, set_entries] = useState<SinkingEntry[]>([])

    useEffect(() => pub_sub.sub("invalid_placement", ({ tile: _tile, item_type: _item_type, invalid_because }) =>
    {
        // set_entries(prev => [...prev, { id: next_id++, tile, item_type }])
        if (invalid_because === "water") play_bubbling_sound()
    }), [])

    // Preload the audio buffer on mount for Web Audio API
    useEffect(load_bubbling_sound, [])

    return <>
        {entries.map(entry => (
            <SinkingItem
                key={entry.id}
                entry={entry}
                cell_size={cell_size}
                on_done={() => set_entries(prev => prev.filter(e => e.id !== entry.id))}
            />
        ))}
    </>
}


function SinkingItem({ entry, cell_size, on_done }: {
    entry: SinkingEntry
    cell_size: number
    on_done: () => void
})
{
    const group_ref = useRef<THREE.Group>(null)
    const start_ref = useRef<number | null>(null)

    const base_x = entry.tile.x * cell_size
    const base_z = entry.tile.y * cell_size
    const base_y = entry.item_type === "solar" ? cell_size * 0.06 : 0

    useEffect(() =>
    {
        const timer = setTimeout(on_done, SINK_DURATION_S * 1000)
        return () => clearTimeout(timer)
    }, [on_done])

    useFrame(({ clock }) =>
    {
        if (!group_ref.current) return
        if (start_ref.current === null) start_ref.current = clock.getElapsedTime()
        const t = Math.min((clock.getElapsedTime() - start_ref.current) / SINK_DURATION_S, 1)

        group_ref.current.position.y = base_y - t * cell_size * 1.4

        const opacity = Math.max(0, 1 - t * 1.5)
        group_ref.current.traverse(obj =>
        {
            if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial)
            {
                obj.material.opacity = opacity
            }
        })
    })

    return (
        <group ref={group_ref} position={[base_x, base_y, base_z]}>
            {entry.item_type === "wind"
                ? <WindTurbine size={cell_size} transparent />
            : entry.item_type === "solar"
                ? <SolarFarmPanels size={cell_size} transparent />
                : null
            }
        </group>
    )
}


/** Shared AudioContext — created once and reused to avoid resource exhaustion. */
let shared_audio_ctx: AudioContext | null = null
function get_audio_context(): AudioContext | null
{
    try
    {
        if (!shared_audio_ctx || shared_audio_ctx.state === "closed")
        {
            shared_audio_ctx = new AudioContext()
        }
        return shared_audio_ctx
    }
    catch (_e)
    {
        return null
    }
}


let bubbles_audio_buffer: AudioBuffer | null = null
let bubbles_audio_loading: Promise<void> | null = null
function load_bubbling_sound(): void
{
    const ctx = get_audio_context()
    if (!ctx) return

    // If already loaded or loading, do nothing
    if (bubbles_audio_buffer || bubbles_audio_loading) return

    // Start loading and decoding the audio buffer
    bubbles_audio_loading = fetch(bubbles_audio_url)
        .then(resp => resp.arrayBuffer())
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => {
            bubbles_audio_buffer = buffer
        })
        .catch(() => {
            // Ignore errors, just don't play sound
        })
        .finally(() => {
            bubbles_audio_loading = null
        })
}

/**
 * Play a random 2s segment of the bubbling sound, allowing overlapping playback.
 * The audio buffer is loaded and cached on first use.
 */
function play_bubbling_sound(): void {
    const ctx = get_audio_context()
    if (!ctx) return

    // Helper to actually play a random segment
    function play_segment() {
        if (!bubbles_audio_buffer) return
        if (!ctx) return
        const duration = bubbles_audio_buffer.duration
        const SEGMENT = 1.0
        // If audio is shorter than SEGMENT, play from start for available duration
        const max_start = Math.max(0, duration - SEGMENT)
        const start = max_start > 0 ? Math.random() * max_start : 0

        const source = ctx.createBufferSource()
        source.buffer = bubbles_audio_buffer
        source.connect(ctx.destination)
        source.start(0, start, Math.min(SEGMENT, duration - start))
        // Clean up after playback
        source.onended = () => {
            source.disconnect()
        }
    }

    // If buffer is loaded, play immediately
    if (bubbles_audio_buffer) {
        // Resume context if needed (for browser policies)
        if (ctx.state === "suspended") ctx.resume()
        play_segment()
        return
    }

    // If already loading, chain playback after load
    if (bubbles_audio_loading) {
        bubbles_audio_loading.then(() => {
            if (ctx.state === "suspended") ctx.resume()
            play_segment()
        })
        return
    }

    // Start loading and decoding the audio buffer
    load_bubbling_sound()
}
