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
    })

    useEffect(() =>
    {
        return pub_sub.sub("power_supply", payload =>
        {
            set_power(existing => ({
                ...existing,
                supply_gw: payload.supply_gw,
                supply_gw_by_type: payload.supply_gw_by_type,
            }))
        }, "model-power")

    }, [])

    return <div
        id="energy_supply_demand_actions"
        className="ui_section"
    >
        <table>
            <tbody>
                {/* <tr>
                    <td></td>
                    <td>GW</td>
                </tr> */}
                <tr>
                    <td><Suburban /></td>
                    <td>-30</td>
                </tr>
                <tr>
                    <td><Urban /></td>
                    <td>-60</td>
                </tr>
                <tr>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                    <td style={{ borderTop: "1px solid var(--colour-border-gray)" }}></td>
                </tr>
                <tr>
                    <td>Wind</td>
                    <td>{power.supply_gw_by_type.wind.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>Solar</td>
                    <td>{power.supply_gw_by_type.solar.toFixed(1)}</td>
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
    }} />
}

function Urban()
{
    return <img src={tiles_1_url} style={{
        width: 70,
        height: 50,
        objectFit: "cover",
        objectPosition: "0px -185px",
    }} />
}
