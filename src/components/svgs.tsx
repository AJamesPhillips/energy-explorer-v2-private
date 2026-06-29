import { CSSProperties } from "react"

import { asset_url } from "../utils/asset_url"
const bluesky_logo_url = asset_url("svgs/bluesky.svg")
const close_icon_url = asset_url("svgs/close.svg")
const github_logo_url = asset_url("svgs/github.svg")
const graph_icon_url = asset_url("svgs/graph.svg")
const info_icon_url = asset_url("svgs/info.svg")
const bulldozer_icon_url = asset_url("svgs/bulldozer.svg")
const carbon_fuels_icon_url = asset_url("svgs/carbon_fuels.svg")
const electricity_bolt_icon_url = asset_url("svgs/electricity_bolt.svg")
const government_policy_icon_url = asset_url("svgs/government_policy.svg")
const magnifying_icon_url = asset_url("svgs/magnifying_glass.svg")
const mail_icon_url = asset_url("svgs/mail.svg")


const default_style: CSSProperties = {
    display: "inline-block",
    verticalAlign: "center",
}

export function BlueSkyLogo(props: { height?: number })
{
    return <img src={bluesky_logo_url} style={{ ...default_style, height: props.height }} />
}

export function GitHubLogo(props: { height?: number })
{
    return <img src={github_logo_url} style={{ ...default_style, height: props.height }} />
}

const default_icon_style: CSSProperties = {
    ...default_style,
    cursor: "pointer",
}

export function CloseIcon(props: { style?: CSSProperties, on_click?: () => void })
{
    return <img
        src={close_icon_url}
        style={{ ...default_icon_style, ...props.style }}
        onClick={props.on_click}
    />
}

export function GraphIcon(props: { style?: CSSProperties })
{
    return <img src={graph_icon_url} style={{ ...default_icon_style, ...props.style }} />
}

export function InfoIcon(props: { style?: CSSProperties })
{
    return <img src={info_icon_url} style={{ ...default_icon_style, ...props.style }} />
}

export function BulldozerIcon(props: { style?: CSSProperties })
{
    return <img src={bulldozer_icon_url} style={{ ...default_icon_style, ...props.style }} />
}

export function CarbonFuelsIcon(props: { style?: CSSProperties })
{
    return <img src={carbon_fuels_icon_url} style={{ ...default_icon_style, ...props.style }} />
}

export function ElectricityBoltIcon(props: { style?: CSSProperties })
{
    return <img src={electricity_bolt_icon_url} style={{ ...default_icon_style, ...props.style }} />
}

export function GovernmentPolicyIcon(props: { style?: CSSProperties })
{
    return <img src={government_policy_icon_url} style={{ ...default_icon_style, ...props.style }} />
}

export function MagnifyingGlassIcon(props: { height?: number })
{
    return <img src={magnifying_icon_url} style={{ ...default_icon_style, height: props.height }} />
}

export function MailIcon(props: { style?: CSSProperties })
{
    return <img src={mail_icon_url} style={{ ...default_icon_style, ...props.style }} />
}

export function Refresh1Icon(props: { style?: CSSProperties })
{
    return <svg
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ ...default_icon_style, ...props.style }}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
}

export function Refresh2Icon(props: { style?: CSSProperties })
{
    return <svg
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ ...default_icon_style, ...props.style }}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 11a8.1 8.1 0 0 1 15.5 -2m0.5 -4v4h-4" />
        <path d="M20 13a8.1 8.1 0 0 1 -15.5 2m-0.5 4v-4h4" />
    </svg>
}

export function StackFrontIcon(props: { style?: CSSProperties })
{
    return <svg
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ ...default_icon_style, ...props.style }}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 4l-8 4l8 4l8 -4l-8 -4" fill="currentColor" />
        <path d="M8 14l-4 2l8 4l8 -4l-4 -2" />
        <path d="M8 10l-4 2l8 4l8 -4l-4 -2" />
    </svg>
}
