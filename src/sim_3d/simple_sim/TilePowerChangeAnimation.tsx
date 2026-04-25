import { Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"

import pub_sub from "../state/pub_sub"
import { CellData } from "./interface"


interface Popup
{
    id: number
    tile: CellData
    change_gw: number
}

let next_id = 0

const DURATION_S = 2.0
const FLOAT_HEIGHT = 1.5

export function TilePowerChangeAnimations({ cell_size }: { cell_size: number })
{
    const [popups, set_popups] = useState<Popup[]>([])

    useEffect(() => pub_sub.sub("tile_power_changed", ({ tile, change_gw }) =>
    {
        if (Math.abs(change_gw) < 0.001) return
        set_popups(prev => [...prev, { id: next_id++, tile, change_gw }])
    }), [])

    return <>
        {popups.map(popup => (
            <FloatingPowerLabel
                key={popup.id}
                popup={popup}
                cell_size={cell_size}
                on_done={() => set_popups(prev => prev.filter(p => p.id !== popup.id))}
            />
        ))}
    </>
}


function FloatingPowerLabel({ popup, cell_size, on_done }: {
    popup: Popup
    cell_size: number
    on_done: () => void
})
{
    const text_ref = useRef<any>(null)
    const start_ref = useRef<number | null>(null)

    const sign = popup.change_gw > 0 ? "+" : ""
    const label = `${sign}${round(popup.change_gw)} GW`
    const color = popup.change_gw > 0 ? "#000000" : "red"

    const base_x = popup.tile.x * cell_size
    const base_y = cell_size * 0.8
    const base_z = popup.tile.y * cell_size

    useEffect(() =>
    {
        const timer = setTimeout(on_done, DURATION_S * 1000)
        return () => clearTimeout(timer)
    }, [on_done])

    useFrame(({ clock }) =>
    {
        if (!text_ref.current) return
        if (start_ref.current === null) start_ref.current = clock.getElapsedTime()
        const t = Math.min((clock.getElapsedTime() - start_ref.current) / DURATION_S, 1)
        text_ref.current.position.y = base_y + t * FLOAT_HEIGHT * cell_size
        text_ref.current.fillOpacity = 1 - t
    })

    return (
        <Text
            ref={text_ref}
            position={[base_x, base_y, base_z]}
            rotation={[0, Math.PI / 4, 0]}
            fontSize={cell_size * 0.5}
            color={color}
            anchorX="center"
            anchorY="middle"
            depthOffset={-1}
        >
            {label}
        </Text>
    )
}


function round(num: number)
{
    if (Math.abs(num) <= 1) return num.toFixed(1)
    if (Math.abs(num) <= 5) return Math.round(num * 2) / 2
    return num.toFixed(0)
}
