import { useEffect, useState } from "react"

import { get_app_state } from "../../../state/store"
import { asset_url } from "../../../utils/asset_url"
import { PowerType, ValueByPowerType } from "../../model/interface"
import pub_sub from "../../state/pub_sub"
import "./EnergySupplyDemandActions.css"


const urban_suburban_url = asset_url("/imgs/urban_suburban.png")
// const tiles_1_url = asset_url("/imgs/tiles_1.png")


export function EnergySupplyDemandActions(_props: {})
{
    const [power, set_power] = useState(get_initial_power)

    useEffect(() =>
    {
        return pub_sub.sub("power_supply_and_demand", payload =>
        {
            set_power({
                supply_gw: payload.supply_GW,
                supply_gw_by_type: payload.supply_GW_by_type,
                capacity_gw_by_type: payload.capacity_GW_by_type,
                demand_gw: payload.demand_GW,
            })
        }, "model-power")
    }, [])

    const diff = power.supply_gw - power.demand_gw
    const sufficient_power = diff >= 0
    const diff_color = diff >= 0 ? (diff === 0 ? "grey" : "green") : "red"

    return <div
        id="energy_supply_demand_actions"
        // className="ui_section"
    >
        <table>
            <tbody>
                <tr>
                    <td/>
                    <td style={{ display: "flex", flexDirection: "column", gap: -3 }}>
                        <img src={urban_suburban_url} style={{ width: 75, marginTop: 10 }} />
                        {/* <Suburban />
                        <Urban /> */}
                    </td>
                    <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div>
                                {power.demand_gw.toFixed(1)}
                                <span className="font_sm"> GW</span>
                            </div>
                            <span className="font_sm" style={{ marginTop: -4 }}> DEMAND</span>
                            <div style={{ color: diff_color }}>
                                {diff.toFixed(1)}
                                <span className="font_sm"> GW</span>
                            </div>
                            <span
                                className="font_sm"
                                style={{ marginTop: -4, color: diff_color }}
                            >
                                {sufficient_power ? "SURPLUS" : "SHORTAGE"}
                            </span>
                        </div>
                    </td>
                    <td/>
                    <td></td>
                </tr>
                <tr>
                    <td/>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td/>
                    <td></td>
                </tr>
                <tr>
                    <td/>
                    <td>Wind</td>
                    <td>{power.supply_gw_by_type.wind.toFixed(1)} / {power.capacity_gw_by_type.wind.toFixed(1)}</td>
                    <td/>
                    <td><BuildButton type="wind" /></td>
                </tr>
                <tr>
                    <td/>
                    <td>Solar</td>
                    <td>{power.supply_gw_by_type.solar.toFixed(1)} / {power.capacity_gw_by_type.solar.toFixed(1)}</td>
                    <td/>
                    <td><BuildButton type="solar" /></td>
                </tr>
                <tr>
                    <td/>
                    <td>Nuclear</td>
                    <td>{power.supply_gw_by_type.nuclear.toFixed(1)} / {power.capacity_gw_by_type.nuclear.toFixed(1)}</td>
                    <td/>
                    <td><BuildButton type="nuclear" /></td>
                </tr>
                <tr>
                    <td/>
                    <td>Gas</td>
                    <td>{power.supply_gw_by_type.gas.toFixed(1)} / {power.capacity_gw_by_type.gas.toFixed(1)}</td>
                    <td/>
                    {/* <td>Build</td> */}
                </tr>
                <tr>
                    <td/>
                    <td>
                        Hydro
                        {/* <span className="font_sm">(run of river)</span> */}
                    </td>
                    <td>{power.supply_gw_by_type.hydro_river.toFixed(1)} / {power.capacity_gw_by_type.hydro_river.toFixed(1)}</td>
                    <td/>
                    {/* <td>Build</td> */}
                </tr>
                <tr>
                    <td/>
                    <td className="font_sm" style={{ borderTop: "1px solid var(--colour-border-gray)" }}>
                        STORAGE
                    </td>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td/>
                    <td></td>
                </tr>
                <tr>
                    <td/>
                    <td>
                        Hydro
                        {/* <span className="font_sm">(pumped)</span> */}
                    </td>
                    <td>{power.supply_gw_by_type.hydro_pumped_storage.toFixed(1)} / {power.capacity_gw_by_type.hydro_pumped_storage.toFixed(1)}</td>
                    <td/>
                    {/* <td>Build</td> */}
                </tr>
                <tr>
                    <td/>
                    <td>Battery</td>
                    <td>{power.supply_gw_by_type.battery.toFixed(1)} / {power.capacity_gw_by_type.battery.toFixed(1)}</td>
                    <td/>
                    {/* <td>Build</td> */}
                </tr>

                {/* <tr>
                    <td/>
                    <td className="font_sm" style={{ borderTop: "1px solid var(--colour-border-gray)" }}>
                        GRID
                    </td>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td/>
                    <td>Build</td>
                    </tr>
                <tr>
                    <td/>
                    <td>Electric</td>
                    <td/>
                    <td>Build</td>
                    </tr>
                <tr>
                    <td/>
                    <td>Gas</td>
                    <td/>
                    <td>Build</td>
                </tr> */}

                {/* <tr>
                    <td/>
                    <td className="font_sm" style={{ borderTop: "1px solid var(--colour-border-gray)" }}>
                        POLICY
                    </td>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td/>
                    <td>Build</td>
                    </tr>
                <tr>
                    <td/>
                    <td>Pricing</td>
                    <td className="font_sm">National</td>
                    <td/>
                    <td>Build</td>
                    </tr>
                <tr>
                    <td/>
                    <td>Oil & Gas</td>
                    <td/>
                    <td>Build</td>
                </tr> */}
            </tbody>
        </table>
    </div>
}


// function Suburban()
// {
//     return <img src={tiles_1_url} style={{
//         width: 70,
//         height: 50,
//         objectFit: "cover",
//         objectPosition: "0px -140px",
//         // marginLeft: -10,
//     }} />
// }

// function Urban()
// {
//     return <img src={tiles_1_url} style={{
//         width: 70,
//         height: 50,
//         objectFit: "cover",
//         objectPosition: "0px -185px",
//         marginTop: -10,
//         // marginRight: -10,
//     }} />
// }


function get_initial_power()
{
    const supply_gw_by_type: ValueByPowerType<number> = {
        wind: 0,
        solar: 0,
        gas: 0,
        nuclear: 0,
        battery: 0,
        hydro_river: 0,
        hydro_pumped_storage: 0,
    }
    const capacity_gw_by_type: ValueByPowerType<number> = {
        ...supply_gw_by_type,
    }

    return {
        supply_gw: 0,
        supply_gw_by_type,
        capacity_gw_by_type,
        demand_gw: 0,
    }
}


function BuildButton(props: { type: PowerType })
{
    return <button
        className="ui_button"
        onClick={() =>
        {
            get_app_state(s => s.building_action.set_building_action({
                type: props.type
            }))
        }}
    >
        Build
    </button>
}
