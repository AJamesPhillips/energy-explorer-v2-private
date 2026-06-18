import { useEffect, useState } from "react"

import { asset_url } from "../../../utils/asset_url"
import pub_sub from "../../state/pub_sub"
import "./EnergySupplyDemandActions.css"

const tiles_1_url = asset_url("/imgs/tiles_1.png")


export function EnergySupplyDemandActions(_props: {})
{
    const [power, set_power] = useState({
        supply_gw: 0,
        supply_gw_by_type: {
            wind: 0,
            solar: 0,
            gas: 0,
            nuclear: 0,
            battery: 0,
            hydro_pumped_storage: 0,
        },
        capacity_gw_by_type: {
            wind: 0,
            solar: 0,
            gas: 0,
            nuclear: 0,
            battery: 0,
            hydro_pumped_storage: 0,
        },
        demand_gw: 0,
    })

    useEffect(() =>
    {
        return pub_sub.sub("power_supply_and_demand", payload =>
        {

            set_power({
                supply_gw: payload.supply_gw,
                supply_gw_by_type: payload.supply_gw_by_type,
                capacity_gw_by_type: payload.capacity_gw_by_type,
                demand_gw: payload.demand_gw,
            })
        }, "model-power")

    }, [])

    return <div
        id="energy_supply_demand_actions"
        className="ui_section"
    >
        <table>
            <tbody>
                <tr>
                    <td style={{ display: "flex", flexDirection: "column", gap: -3 }}>
                        <Suburban />
                        <Urban />
                    </td>
                    <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div>
                                {power.demand_gw.toFixed(1)}
                                <span style={{ fontSize: "var(--font-small)" }}> GW</span>
                            </div>
                            <span style={{ fontSize: "var(--font-small)", marginTop: -4 }}> DEMAND</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                </tr>
                <tr>
                    <td>Wind</td>
                    <td>{power.supply_gw_by_type.wind.toFixed(1)} / {power.capacity_gw_by_type.wind.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>Solar</td>
                    <td>{power.supply_gw_by_type.solar.toFixed(1)} / {power.capacity_gw_by_type.solar.toFixed(1)}</td>
                </tr>
                <tr>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                </tr>
            </tbody>
        </table>
    </div>
}


function Suburban()
{
    return <img src={tiles_1_url} style={{
        width: 70,
        height: 50,
        objectFit: "cover",
        objectPosition: "0px -140px",
        // marginLeft: -10,
    }} />
}

function Urban()
{
    return <img src={tiles_1_url} style={{
        width: 70,
        height: 50,
        objectFit: "cover",
        objectPosition: "0px -185px",
        marginTop: -10,
        // marginRight: -10,
    }} />
}
