import { useEffect, useState } from "react"
import { lerp } from "three/src/math/MathUtils.js"

import { LimitedViewType } from "../interface"
import { PowerStats } from "../model/old_interface"
import pub_sub from "../state/pub_sub"
import "./PowerStatus.css"


const open_power_demand_source = () => pub_sub.pub("show_info_and_data_sources", "power_demand")
const open_power_supply_source = () => pub_sub.pub("show_info_and_data_sources", "power_supply")


export function PowerStatus ({ power, datetime }: { view: LimitedViewType, power: PowerStats, datetime?: number })
{
    const [current_supply_gw, set_current_supply_gw] = useState(power.supply_gw)
    const [current_demand_gw, set_current_demand_gw] = useState(power.demand_gw)

    useEffect(() =>
    {
        return pub_sub.sub("animation_tick", ({ delta_seconds }) =>
        {
            // Smoothly animate changes in supply and demand
            const supply_diff = power.supply_gw - current_supply_gw
            const demand_diff = power.demand_gw - current_demand_gw

            const new_current_supply_gw = current_supply_gw + smooth_change(supply_diff, delta_seconds)
            const new_current_demand_gw = current_demand_gw + smooth_change(demand_diff, delta_seconds)

            set_current_supply_gw(new_current_supply_gw)
            set_current_demand_gw(new_current_demand_gw)
        })
    })

    const diff = Math.round(current_supply_gw - current_demand_gw)
    const is_surplus = diff >= 0
    const demand_status_text = `Demand of ${Math.round(current_demand_gw)} GW`
    const supply_status_text = is_surplus ? `${diff} GW surplus` : `${-diff} GW deficit. More power needed!`
    const status_color = is_surplus ? "green" : "red"

    return <>
        <div id="power_status_container">
            <table style={{ margin: "0 auto" }}>
                <tbody>
                    <tr className="supply_demand_labels">
                        <td
                            className="supply_demand_label"
                            title={demand_status_text}
                            onClick={open_power_demand_source}
                        >
                            Demand
                        </td>
                        <td />
                        <td
                            className="supply_demand_label"
                            style={{ textAlign: "left", color: status_color }}
                            title={supply_status_text}
                            onClick={open_power_supply_source}
                        >
                            {is_surplus ? "Surpluse" : "Shortage"}
                        </td>
                    </tr>

                    <tr style={{ lineHeight: 0.9, verticalAlign: "baseline" }}>
                        <td
                            style={{ textAlign: "right", fontSize: "var(--font-huge)" }}
                            title={demand_status_text}
                            onClick={open_power_demand_source}
                        >
                            {Math.round(current_demand_gw)}
                        </td>
                        <td style={{ fontSize: "var(--font-medium)" }}>
                            GW
                        </td>
                        <td
                            style={{ color: status_color, textAlign: "left", fontSize: "var(--font-huge)" }}
                            title={supply_status_text}
                            onClick={open_power_supply_source}
                        >
                            {is_surplus ? "+" : ""}{diff}
                        </td>
                    </tr>

                    <tr id="power_status_sources">
                        <td
                            style={{ textAlign: "right" }}
                            onClick={open_power_demand_source}
                        >
                            (source)
                        </td>
                        <td />
                        <td
                            style={{ textAlign: "left" }}
                            onClick={open_power_supply_source}
                        >
                            (source)
                        </td>
                    </tr>
                </tbody>
            </table>

            <div
                className={"text_shortage" + (is_surplus ? " surplus" : " shortage")}
                title={supply_status_text}
            >
                SHORTAGE
            </div>
            <div>
                <DatetimeDisplay datetime={datetime} />
            </div>
        </div>
    </>
}



function DatetimeDisplay({ datetime }: { datetime?: number })
{
    if (!datetime) return null

    const date = new Date(datetime)
    const hours = date.getUTCHours().toString().padStart(2, "0")
    const minutes = (Math.floor(date.getUTCMinutes() / 30) * 30).toString().padStart(2, "0")
    // const day = date.getUTCDate().toString().padStart(2, "0")
    // const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
    // const year = date.getUTCFullYear()

    return (
        <div style={{ fontSize: 16 }}>
            Time: {`${hours}:${minutes}`}
        </div>
    )
}


function smooth_change(t: number, delta: number)
{
    const sign = Math.sign(t)
    const abs = Math.abs(t)
    if (abs < 0.01) return t
    return (lerp(1, 3, abs) * sign) * delta
}
