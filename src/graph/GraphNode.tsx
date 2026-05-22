import { component_is_number } from "core/data/component_is"
import { JSX } from "react"

import { PlacedNode } from "./interface"
import { NODE_H, NODE_TEXT_SIZE, NODE_TEXT_SIZE_SMALL, NODE_TEXT_V_FACTOR, NODE_W } from "./layout_constants"
import {
    AGGREEMENT_COLOUR,
    format_diff_text,
    get_color_for_relative_difference,
    get_numeric_result_value,
    LIKELY_AGGREEMENT_COLOUR,
    render_component,
} from "./utils"


const MAX_TITLE_CHARS = 25
const TITLE_CHARS_WRAP = MAX_TITLE_CHARS
const MIN_REL_DIFF = 0.01
const MAX_REL_DIFF = 0.25


function truncate_wrap_text(text: string, max_chars: number, wrap_at: number, cx: number): JSX.Element | string
{
    if (text.length <= max_chars) return text

    const lines: string[] = []
    let reversed = text.trim().split("").reverse().join("")

    while (reversed.length > wrap_at)
    {
        // Break on nearest white space before wrap_at, or if there isn't one, just break at wrap_at.
        const break_at = reversed.lastIndexOf(" ", wrap_at) || wrap_at
        const chunk = reversed.slice(0, break_at).split("").reverse().join("")
        reversed = reversed.slice(break_at)
        lines.push(chunk)
    }
    lines.push(reversed.split("").reverse().join(""))
    lines.reverse()

    // Join with <tspan>s to allow multi-line text in SVG.
    return <>
        {lines.map((line, i) => <tspan key={i} x={cx} dy={(i === 0 ? 0 : 1.2) + "em"}>{line}</tspan>)}
    </>
}


export function GraphNode(props: { compact: boolean, node: PlacedNode, key?: string, set_show_agreements: (show: boolean) => void }): JSX.Element
{
    const { compact, node } = props
    const { diff } = node
    const x = node.cx - NODE_W(compact) / 2
    const y = node.y

    if (node.graph === null)
    {
        return <g>
            <rect
                x={x}
                y={y}
                width={NODE_W(compact)}
                height={NODE_H(compact)}
                rx={6}
                fill="#f5f5f5"
                stroke={AGGREEMENT_COLOUR}
                strokeWidth={1}
                strokeDasharray="4 3"
                cursor="pointer"
                onClick={() => props.set_show_agreements(true)}
            />
            <text
                x={node.cx}
                y={y + NODE_H(compact) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={NODE_TEXT_SIZE(compact)}
                fill={AGGREEMENT_COLOUR}
                cursor="pointer"
                pointerEvents="none"
            >
                <tspan x={node.cx} dy={0} pointerEvents="none">{`${node.hidden_count} nodes in agreement`}</tspan>
                <tspan x={node.cx} dy={20} pointerEvents="none">Click to show all</tspan>
            </text>
        </g>
    }

    const background_colour = diff === false
        ? LIKELY_AGGREEMENT_COLOUR
        : get_color_for_relative_difference(diff?.relative || 0, MIN_REL_DIFF, MAX_REL_DIFF)
    const title = render_component(node.graph.component)
    // @ts-ignore
    const title_short = truncate_wrap_text(title, MAX_TITLE_CHARS, TITLE_CHARS_WRAP, node.cx)
    const diff_text = diff ? format_diff_text(diff.absolute, diff.relative, node.graph.component.units) : false

    const numeric_value = component_is_number(node.graph.component) ? get_numeric_result_value(node.graph.component) : undefined

    let href = `https://wikisim.org/wiki/${node.graph.component.id.to_str()}`

    const multiple_versions = node.graph.component.multiple_versions
    const newer_version_available = multiple_versions && multiple_versions.latest_version > node.graph.component.id.version
    if (newer_version_available)
    {
        // href = `https://wikisim.org/wiki/${node.graph.component.id.id}`
    }

    return <g>
        <a
            href={href}
            rel="noopener noreferrer"
        >
            <rect
                x={x}
                y={y}
                width={NODE_W(compact)}
                height={NODE_H(compact)}
                rx={6}
                fill={background_colour}
                stroke="#999"
                strokeWidth={1}
                cursor="pointer"
            >
                <title>{title}</title>
            </rect>

            <text
                x={node.cx}
                y={y + NODE_TEXT_V_FACTOR(22, compact)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={NODE_TEXT_SIZE(compact)}
                fontWeight="bold"
                fill="#222"
                cursor="default"
                pointerEvents="none"
            >
                {title_short}
            </text>
            {diff_text && <>
                <text
                    x={node.cx}
                    y={y + NODE_TEXT_V_FACTOR(55, compact)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={NODE_TEXT_SIZE_SMALL(compact)}
                    fill="#444"
                    pointerEvents="none"
                >
                    {diff_text.line1}
                </text>
                <text
                    x={node.cx}
                    y={y + NODE_TEXT_V_FACTOR(68, compact)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={NODE_TEXT_SIZE_SMALL(compact)}
                    fill="#444"
                    pointerEvents="none"
                >
                    {diff_text.line2}
                </text>
            </>}
            {!diff_text && numeric_value !== undefined && <text
                x={node.cx}
                y={y + NODE_TEXT_V_FACTOR(41, compact)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={NODE_TEXT_SIZE_SMALL(compact)}
                fill="#444"
                pointerEvents="none"
            >
                {/* {numeric_value.toFixed(0)} */}
            </text>}

            {newer_version_available && <UpdateVersionIcon
                x={x + NODE_W(compact) - 22}
                y={y + NODE_H(compact) - 22}
                version={multiple_versions!.latest_version}
            />}
        </a>
    </g>
}


function UpdateVersionIcon(props: { x: number, y: number, version: number })
{
    return <g transform={`translate(${props.x}, ${props.y})`}>
        <rect
            x={0}
            y={0}
            width={20}
            height={20}
            fill="rgba(0, 0, 0, 0)"
        ></rect>
        <path d="M10 6 L 10 10.5 L 12.3 12.8" stroke="#000" stroke-width="2" fill="none"/>
        <path
            d="M10 19a9 9 0 1 0-7.85 -4.6L.5 16H6v-5.5l-2.38 2.38A7 7 0 1 1 10 17v2"
            stroke-width="1"
            transform="scale(-1,1) translate(-20,0)"
        />
        <title>A newer version of this component is in this graph, please upgrade this one to match v{props.version}</title>
    </g>
}
