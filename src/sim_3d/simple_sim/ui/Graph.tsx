import { useCallback, useEffect, useRef, useState } from "react"

import { DataPoint } from "../../data/fossil_fuels/process_data_component"
import pub_sub from "../../state/pub_sub"
import { InfoSectionId } from "../../state/pub_sub/interface"
import { GRAPH_CONSTANTS } from "../constants"
import "./Graph.css"
import { graph_compute_data_series, GraphDataSeries } from "./graph_compute_data_series"


const { HEIGHT, PADDING, PLOT_W, PLOT_H } = GRAPH_CONSTANTS

function fmt_pop(n: number, detailed = 0): string
{
    if (n >= 1e9) return `${(n / 1e9).toFixed(1 + detailed)}B`
    if (n >= 1e7) return `${(n / 1e6).toFixed(0 + detailed)}M`
    if (n >= 1e6) return `${(n / 1e6).toFixed(1 + detailed)}M`
    if (n >= 1e4) return `${(n / 1e3).toFixed(0 + detailed)}K`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1 + detailed)}K`
    return `${n}`
}


export interface GraphProps<Fields extends string[] = []>
{
    graph_title: string
    data_source_name: InfoSectionId

    year: number
    data_by_year: Record<number, {[f in Fields[number]]: DataPoint}>
    colour_by_series: {[f in Fields[number]]: string | false}
    get_values_description: (year: number, values: {[f in Fields[number]]: DataPoint}) => { description: string, is_projected: boolean }
}
export function Graph<Fields extends string[]>(props: GraphProps<Fields>)
{
    const { data_by_year, colour_by_series, get_values_description } = props

    const [year, set_year] = useState(props.year)


    const all_years = Object.keys(data_by_year).map(Number).sort((a, b) => a - b)
    const all_rows = all_years.map(y => data_by_year[y]!)
    const all_values = all_rows.flatMap(row => Object.values(row).map(dp => (dp as DataPoint).value).filter(v => v !== undefined))

    const data_series: GraphDataSeries[] = graph_compute_data_series(data_by_year, colour_by_series)

    const min_year = all_years[0]!
    const max_year = all_years[all_years.length - 1]!
    const min_value = Math.min(...all_values) * 0.97
    const max_value = Math.max(...all_values) * 1.03

    function x_of(year: number) { return ((year - min_year) / (max_year - min_year)) * PLOT_W() }
    function y_of(pop: number) { return PLOT_H - ((pop - min_value) / (max_value - min_value)) * PLOT_H }

    // Dragging
    const svg_ref = useRef<SVGSVGElement>(null)
    const [dragging, set_dragging] = useState(false)

    const year_from_client_x = useCallback((client_x: number) =>
    {
        if (!svg_ref.current) return year
        const rect = svg_ref.current.getBoundingClientRect()
        const px = client_x - rect.left - PADDING.left
        const ratio = Math.max(0, Math.min(1, px / PLOT_W()))
        return Math.round(min_year + ratio * (max_year - min_year))
    }, [min_year, max_year, year])

    const handle_move = useCallback((client_x: number) =>
    {
        const year = year_from_client_x(client_x)
        set_year(year)
        // const new_pop = get_values_at_year(year, data_by_year)
        // set_population(new_pop.value)
    }, [year_from_client_x, get_values_at_year])//, set_population])

    useEffect(() =>
    {
        if (!dragging) return
        const on_move = (e: MouseEvent | TouchEvent) =>
        {
            const client_x = "touches" in e ? e.touches[0]!.clientX : e.clientX
            handle_move(client_x)
        }
        const on_up = () => set_dragging(false)

        window.addEventListener("mousemove", on_move)
        window.addEventListener("mouseup", on_up)
        window.addEventListener("touchmove", on_move)
        window.addEventListener("touchend", on_up)
        return () =>
        {
            window.removeEventListener("mousemove", on_move)
            window.removeEventListener("mouseup", on_up)
            window.removeEventListener("touchmove", on_move)
            window.removeEventListener("touchend", on_up)
        }
    }, [dragging, handle_move])

    const cursor_x = x_of(year)
    const values_at_cursor = get_values_at_year(year, data_by_year)
    const { description, is_projected } = get_values_description(year, values_at_cursor)

    const y_tick_count = 3
    const y_ticks = Array.from({ length: y_tick_count }, (_, i) =>
    {
        const pop = min_value + (i / (y_tick_count - 1)) * (max_value - min_value)
        return { pop, y: y_of(pop) }
    })

    const x_tick_years = all_years.filter((_, i) => i % Math.ceil(all_years.length / 4) === 0)

    return (
        <div className="data_graph ui_info_box">
            <div className="ui_info_box_header">
                <span
                    className="source_info_label"
                    onClick={() => pub_sub.pub("show_info_and_data_sources", props.data_source_name)}
                >
                    {props.graph_title} <span className="source_info_link">(source)</span>
                </span>

                <span style={{ fontWeight: "bold", color: is_projected ? "#e07020" : "#333" }}>
                    {description} ({year}{is_projected ? " proj." : ""})
                </span>
            </div>
            <svg
                ref={svg_ref}
                width={GRAPH_CONSTANTS.WIDTH()}
                height={HEIGHT}
                style={{
                    display: "block",
                    cursor: "ew-resize",
                    overflow: "visible",
                    // This prevents the screen from being dragged down and
                    // potentially causing the browser to show its refresh prompt
                    // or to actually refresh the page.
                    touchAction: "none",
                }}
                onMouseDown={e => {
                    set_dragging(true)
                    handle_move(e.clientX)
                }}
                onTouchStart={e => {
                    set_dragging(true)
                    handle_move(e.touches[0]!.clientX)
                }}
            >
                <g transform={`translate(${PADDING.left},${PADDING.top})`}>
                    {/* Y axis ticks */}
                    {y_ticks.map(({ pop, y }) => (
                        <g key={pop}>
                            <line x1={-4} y1={y} x2={PLOT_W()} y2={y} stroke="#e0e0e0" strokeWidth={1} />
                            <text x={-6} y={y} textAnchor="end" dominantBaseline="middle" fontSize="var(--font-small)" fill="#888">
                                {fmt_pop(pop)}
                            </text>
                        </g>
                    ))}

                    {/* X axis ticks */}
                    {x_tick_years.map(y => (
                        <g key={y}>
                            <line x1={x_of(y)} y1={PLOT_H} x2={x_of(y)} y2={PLOT_H + 4} stroke="#aaa" strokeWidth={1} />
                            <text x={x_of(y)} y={PLOT_H + 14} textAnchor="middle" fontSize="var(--font-small)" fill="#888">{y}</text>
                        </g>
                    ))}
                    <text x={x_of(max_year)} y={PLOT_H + 14} textAnchor="end" fontSize="var(--font-small)" fill="#e07020">{max_year}</text>

                    {data_series.map(series => <>
                        {/* Projected line (dashed) */}
                        <polyline
                            points={series.proj_points_polyline}
                            fill="none"
                            stroke={series.colour_projected}
                            strokeWidth={1.5}
                            strokeDasharray="4 3"
                            opacity={0.7}
                        />

                        {/* Known data line */}
                        <polyline
                            points={series.known_points_polyline}
                            fill="none"
                            stroke={series.colour}
                            strokeWidth={2}
                        />

                        {/* Known data points */}
                        {series.known_points.map(dp => (
                            <circle
                                key={dp.year}
                                cx={dp.x}
                                cy={dp.y}
                                r={3}
                                fill={series.colour}
                            />
                        ))}
                    </>)}

                    {/* Draggable year cursor */}
                    <line
                        x1={cursor_x} y1={0}
                        x2={cursor_x} y2={PLOT_H}
                        stroke={is_projected ? "#e07020" : "#444"}
                        strokeWidth={1.5}
                        strokeDasharray="3 2"
                    />
                    {/* <circle
                        cx={cursor_x}
                        cy={y_of(population)}
                        r={5}
                        fill={is_projected ? "#e07020" : "#2a7ae4"}
                        stroke="white"
                        strokeWidth={1.5}
                    /> */}
                </g>
            </svg>
        </div>
    )
}



function get_values_at_year<Fields extends string[]>(
    year: number,
    data_by_year: Record<number, {[f in Fields[number]]: DataPoint}>,
): {[f in Fields[number]]: DataPoint}
{
    year = Math.round(year)
    if (data_by_year[year] !== undefined) return data_by_year[year]!
    return Object.values(data_by_year)[0]!
}
