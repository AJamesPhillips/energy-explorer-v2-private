import { useState } from "react"

// import pub_sub from "../../state/pub_sub"
import { FloatingPowerLabel } from "./FloatingPowerLabel"
import { Popup } from "./interface"


// let next_id = 0

export function TilePowerChangeAnimations({ cell_size }: { cell_size: number })
{
    const [popups, set_popups] = useState<Popup[]>([])

    // useEffect(() => pub_sub.sub("tile_changed", ({ tile, change_gw }) =>
    // {
    //     if (Math.abs(change_gw) < 0.001) return
    //     set_popups(prev => [...prev, { id: next_id++, tile, change_gw }])
    // }), [])

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
