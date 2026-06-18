import { Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"

import { Popup } from "./interface"



const CONSTANTS =
{
    DURATION_S: 2.0,
    FLOAT_HEIGHT: 1.5,
}


export function FloatingPowerLabel({ popup, cell_size, on_done }: {
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

    const base_x = 0 // popup.tile.x * cell_size
    const base_y = cell_size * 0.8
    const base_z = 0 // popup.tile.y * cell_size

    useEffect(() =>
    {
        const timer = setTimeout(on_done, CONSTANTS.DURATION_S * 1000)
        return () => clearTimeout(timer)
    }, [on_done])

    useFrame(({ clock }) =>
    {
        if (!text_ref.current) return
        if (start_ref.current === null) start_ref.current = clock.getElapsedTime()
        const t = Math.min((clock.getElapsedTime() - start_ref.current) / CONSTANTS.DURATION_S, 1)
        text_ref.current.position.y = base_y + t * CONSTANTS.FLOAT_HEIGHT * cell_size
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
