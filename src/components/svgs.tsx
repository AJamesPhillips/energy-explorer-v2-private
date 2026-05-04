import { CSSProperties } from "react"

import { asset_url } from "../utils/asset_url"
const bluesky_logo_url = asset_url("svgs/bluesky.svg")
const github_logo_url = asset_url("svgs/github.svg")
const graph_logo_url = asset_url("svgs/graph.svg")
const info_logo_url = asset_url("svgs/info.svg")
const magnifying_logo_url = asset_url("svgs/magnifying_glass.svg")
const mail_logo_url = asset_url("svgs/mail.svg")


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

export function GraphLogo(props: { style?: CSSProperties })
{
    return <img src={graph_logo_url} style={{ ...default_style, ...props.style }} />
}

export function InfoLogo(props: { style?: CSSProperties })
{
    return <img src={info_logo_url} style={{ ...default_style, ...props.style }} />
}

export function MagnifyingGlassLogo(props: { height?: number })
{
    return <img src={magnifying_logo_url} style={{ ...default_style, height: props.height }} />
}

export function MailLogo(props: { style?: CSSProperties })
{
    return <img src={mail_logo_url} style={{ ...default_style, ...props.style }} />
}
