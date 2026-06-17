import { DEFAULT_SPEED } from "../../state/game_datetime/constants"
import { GameSpeed } from "../../state/game_datetime/interface"
import pub_sub from "../state/pub_sub"


const NORMAL_SPEED = 3600 / 5
const FAST_SPEED = 3600 * 10

let sim_seconds_per_real_second: number
let last_real = 0
let start_timestamp: number
let current_timestamp: number
let end_timestamp: number
let year_start_timestamp: number

export function init(opts: { start_timestamp: number, current_timestamp: number, end_timestamp: number })
{
    start_timestamp = opts.start_timestamp
    current_timestamp = opts.current_timestamp
    end_timestamp = opts.end_timestamp
    year_start_timestamp = new Date(new Date(start_timestamp).getUTCFullYear(), 0, 1).getTime()
    loop()
}

export function set_speed(g: GameSpeed)
{
    sim_seconds_per_real_second = g === "paused" ? 0 : g === "normal" ? NORMAL_SPEED : FAST_SPEED
    if (g !== "paused" && start_timestamp) loop()
}
set_speed(DEFAULT_SPEED)

function loop()
{
    if (!sim_seconds_per_real_second) return

    const now = performance.now()
    const delta_ms = (now - last_real)
    last_real = now
    current_timestamp += delta_ms * sim_seconds_per_real_second

    publish_datetime()
    requestAnimationFrame(loop)
}

export function jump_to(new_datetime_ms: number)
{
    current_timestamp = Math.max(start_timestamp, Math.min(end_timestamp, new_datetime_ms))
    publish_datetime()
}


function publish_datetime()
{
    const datetime = new Date(current_timestamp)
    const datetime_annual_hourly_index1 = Math.floor((current_timestamp - year_start_timestamp) / (1000 * 3600)) % 8760
    const datetime_annual_hourly_index2 = (datetime_annual_hourly_index1 + 1) % 8760
    // The mix is the number of minutes into the hour, divided by 60, so it is a number between 0 and 1
    const datetime_annual_hourly_index_mix = datetime.getUTCMinutes() / 60

    pub_sub.pub("simulation_datetime", {
        datetime_ms: current_timestamp,
        datetime,
        datetime_annual_hourly_index1,
        datetime_annual_hourly_index2,
        datetime_annual_hourly_index_mix,
    })
}


export const sim_clock = {
    init,
    set_speed,
    jump_to,
}
