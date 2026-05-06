import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { PopulationByYear } from "../../data/population/process_data_component"
import pub_sub from "../../state/pub_sub"
import "./Graph.css"


const WIDTH = 320
const HEIGHT = 120
const PADDING = { top: 10, right: 10, bottom: 22, left: 48 }
const PLOT_W = WIDTH - PADDING.left - PADDING.right
const PLOT_H = HEIGHT - PADDING.top - PADDING.bottom

function fmt_pop(n: number, detailed = 0): string
{
    if (n >= 1e9) return `${(n / 1e9).toFixed(1 + detailed)}B`
    if (n >= 1e7) return `${(n / 1e6).toFixed(0 + detailed)}M`
    if (n >= 1e6) return `${(n / 1e6).toFixed(1 + detailed)}M`
    if (n >= 1e4) return `${(n / 1e3).toFixed(0 + detailed)}K`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1 + detailed)}K`
    return `${n}`
}


interface GraphPopulationProps
{
    population_by_year: PopulationByYear
    year: number
    population: number
    set_population: (population: number) => void
}
export function GraphPopulation(props: GraphPopulationProps)
{
    const { population_by_year, population, set_population } = props

    // When this component is closed we reset the population
    useEffect(() =>
    {
        return () => set_population(props.population)
    }, [set_population])

    const [year, set_year] = useState<number>(props.year)

    const { all_years, all_pops, known_years, projected_years } = useMemo(() =>
    {
        const all_years = Object.keys(population_by_year).map(Number).sort((a, b) => a - b)
        const all_pops = all_years.map(y => population_by_year[y]!.value)

        const known_years: number[] = []
        const projected_years: number[] = []
        all_years.forEach(y =>
        {
            if (population_by_year[y]!.is_projected) projected_years.push(y)
            else known_years.push(y)
        })

        return { all_years, all_pops, known_years, projected_years }
    }, [population_by_year])

    const min_year = all_years[0]!
    const max_year = all_years[all_years.length - 1]!
    const min_pop = Math.min(...all_pops) * 0.97
    const max_pop = Math.max(...all_pops) * 1.03

    function x_of(year: number) { return ((year - min_year) / (max_year - min_year)) * PLOT_W }
    function y_of(pop: number) { return PLOT_H - ((pop - min_pop) / (max_pop - min_pop)) * PLOT_H }


    // Known points polyline
    const known_points = known_years.map(y => `${x_of(y)},${y_of(population_by_year[y]!.value)}`)
    const proj_start_year = known_years[known_years.length - 1]!
    const proj_years_list = [proj_start_year, ...projected_years]
    const proj_points = proj_years_list.map(y => `${x_of(y)},${y_of(population_by_year[y]!.value)}`)

    // Dragging
    const svg_ref = useRef<SVGSVGElement>(null)
    const [dragging, set_dragging] = useState(false)

    const year_from_client_x = useCallback((client_x: number) =>
    {
        if (!svg_ref.current) return year
        const rect = svg_ref.current.getBoundingClientRect()
        const px = client_x - rect.left - PADDING.left
        const ratio = Math.max(0, Math.min(1, px / PLOT_W))
        return Math.round(min_year + ratio * (max_year - min_year))
    }, [min_year, max_year, year])

    const handle_move = useCallback((client_x: number) =>
    {
        const year = year_from_client_x(client_x)
        set_year(year)
        const new_pop = get_pop_at_year(year, population_by_year)
        set_population(new_pop.value)
    }, [year_from_client_x, get_pop_at_year, set_population])

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
    const population_at_cursor = get_pop_at_year(year, population_by_year)
    const is_projected = population_at_cursor.is_projected

    const y_tick_count = 3
    const y_ticks = Array.from({ length: y_tick_count }, (_, i) =>
    {
        const pop = min_pop + (i / (y_tick_count - 1)) * (max_pop - min_pop)
        return { pop, y: y_of(pop) }
    })

    const x_tick_years = known_years.filter((_, i) => i % Math.ceil(known_years.length / 4) === 0)

    return (
        <div className="data_graph ui_info_box">
            <div className="ui_info_box_header">
                <span
                    className="source_info_label"
                    onClick={() => pub_sub.pub("show_info_and_data_sources", "population")}
                >
                    Population <span className="source_info_link">(source)</span>
                </span>

                <span style={{ fontWeight: "bold", color: is_projected ? "#e07020" : "#333" }}>
                    {fmt_pop(population, 1)} ({year}{is_projected ? " proj." : ""})
                </span>
            </div>
            <svg
                ref={svg_ref}
                width={WIDTH}
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
                            <line x1={-4} y1={y} x2={PLOT_W} y2={y} stroke="#e0e0e0" strokeWidth={1} />
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

                    {/* Projected line (dashed) */}
                    <polyline
                        points={proj_points.join(" ")}
                        fill="none"
                        stroke="#e07020"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        opacity={0.7}
                    />

                    {/* Known data line */}
                    <polyline
                        points={known_points.join(" ")}
                        fill="none"
                        stroke="#2a7ae4"
                        strokeWidth={2}
                    />

                    {/* Known data points */}
                    {known_years.map(y => (
                        <circle
                            key={y}
                            cx={x_of(y)}
                            cy={y_of(population_by_year[y]!.value)}
                            r={3}
                            fill="#2a7ae4"
                        />
                    ))}

                    {/* Draggable year cursor */}
                    <line
                        x1={cursor_x} y1={0}
                        x2={cursor_x} y2={PLOT_H}
                        stroke={is_projected ? "#e07020" : "#444"}
                        strokeWidth={1.5}
                        strokeDasharray="3 2"
                    />
                    <circle
                        cx={cursor_x}
                        cy={y_of(population)}
                        r={5}
                        fill={is_projected ? "#e07020" : "#2a7ae4"}
                        stroke="white"
                        strokeWidth={1.5}
                    />
                </g>
            </svg>
        </div>
    )
}



function get_pop_at_year(
    year: number,
    population_by_year: PopulationByYear,
    // args: {
    //     population_by_year: PopulationByYear,
    //     projected_years: Record<number, number>,
    //     all_years: number[],
    //     all_pops: number[],
    // }
): { value: number, is_projected?: boolean }
{
    // const { population_by_year, projected_years, all_years, all_pops } = args

    year = Math.round(year)
    if (population_by_year[year] !== undefined) return population_by_year[year]!
    // // interpolate
    // const sorted = all_years
    // for (let i = 0; i < sorted.length - 1; i++)
    // {
    //     const y0 = sorted[i]!
    //     const y1 = sorted[i + 1]!
    //     if (year >= y0 && year <= y1)
    //     {
    //         const t = (year - y0) / (y1 - y0)
    //         const p0 = projected_years[y0] ?? population_by_year[y0]!
    //         const p1 = projected_years[y1] ?? population_by_year[y1]!
    //         return p0 + t * (p1 - p0)
    //     }
    // }
    return Object.values(population_by_year)[0]!
}
