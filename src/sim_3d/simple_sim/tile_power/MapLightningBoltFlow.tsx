
import { useEffect, useState } from "react"

import pub_sub from "../../state/pub_sub"
import { LightningBoltFlow } from "./LightningBoltFlow"


interface FlowEntry
{
    id: string
    x: number
    y: number
    supply_gw: number
    demand_gw: number
}

export function MapLightningBoltFlow()
{
    const [flows, set_flows] = useState<FlowEntry[]>([])

    useEffect(() => pub_sub.sub("power_supply_and_demand", ({ gen_cap_store_MW_by_h3r4, demand_GW_by_h3r4, h3r4_cell_to_xy }) =>
    {
        const ids = new Set<string>()
        Object.keys(gen_cap_store_MW_by_h3r4).forEach(k => ids.add(k))
        Object.keys(demand_GW_by_h3r4).forEach(k => ids.add(k))

        const next: FlowEntry[] = []
        ids.forEach(h3_id =>
        {
            const supply_gw = (gen_cap_store_MW_by_h3r4[h3_id]?.total_generated_MW ?? 0) / 1000
            const demand_gw = demand_GW_by_h3r4[h3_id]?.demand_GW ?? 0
            if (!supply_gw && !demand_gw) return
            const xy = h3r4_cell_to_xy.get(h3_id)
            if (!xy) return
            next.push({ id: h3_id, x: xy.x, y: xy.y, supply_gw, demand_gw })
        })

        set_flows(next)
    }, "MapLightningBoltFlow"), [])

    return <group>
        {flows.map(f => (
            <LightningBoltFlow
                key={f.id}
                x={f.x}
                y={f.y}
                supply_gw={f.supply_gw}
                // Do not show demand, instead we'll reserve the red lighting bolts
                // for power shortage
                // demand_gw={f.demand_gw}
                demand_gw={0}
            />
        ))}
    </group>
}
