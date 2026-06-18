import { useEffect, useState } from "react"

import { get_app_state } from "../../../state/store"
import pub_sub from "../../state/pub_sub"


const month_formatter = new Intl.DateTimeFormat("default", { month: "long" })

export function GameDatetimeUI()
{
    const [dt, set_dt] = useState(new Date())
    useEffect(() => pub_sub.sub("simulation_datetime", ({ datetime }) =>
    {
        set_dt(datetime)
    }), [])

    return <div className="ui_section" style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    }}>
        <div>
            <span style={{ fontSize: "var(--font-small)", fontWeight: "bold" }}>
                {dt.getUTCFullYear()} {month_formatter.format(dt)} {dt.getUTCDate()}
            </span>
            <br/>
            <span style={{ fontSize: "var(--font-medium)", fontWeight: "bold" }}>
                {dt.getUTCHours().toString().padStart(2, "0")}:{(Math.floor(dt.getUTCMinutes() / 10) * 10).toString().padStart(2, "0")}
            </span>
        </div>

        <SpeedControl />
    </div>
}



const speed_button_style = { padding: "2px 4px", minHeight: 0, height: 20 }
function SpeedControl()
{
    const { speed, set_speed } = get_app_state(state => state.game_datetime)

    return <div style={{ display: "flex", flexDirection: "row", gap: 4, marginLeft: 8 }}>
        <div
            className={"ui_button " + (speed === "paused" ? "active" : "")}
            style={speed_button_style}
            onClick={() => set_speed("paused")}
        >
            {pause_svg}
        </div>
        <div
            className={"ui_button " + (speed === "normal" ? "active" : "")}
            style={speed_button_style}
            onClick={() => set_speed("normal")}
        >
            {play_svg}
        </div>
        <div
            className={"ui_button " + (speed === "fast" ? "active" : "")}
            style={speed_button_style}
            onClick={() => set_speed("fast")}
        >
            {fast_play_svg}
        </div>
    </div>
}

const pause_svg = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
	<path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
</svg>

const play_svg = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
</svg>

const fast_play_svg = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M2 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z" />
	<path d="M13 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z" />
</svg>
