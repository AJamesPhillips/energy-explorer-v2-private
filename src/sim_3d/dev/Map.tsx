import { geoMercator, geoPath, GeoPermissibleObjects } from "d3-geo"
import * as h3 from "h3-js"
import { useCallback, useEffect, useRef } from "react"
import { feature } from "topojson-client"

import { UK_EEZ_COORDS } from "../data/eez/data"
import { WorldAtlas } from "./interface"
import { FRANCE_ID, IRELAND_ID, NEARBY_COUNTRY_IDS, UK_ID } from "./map_data"


export function Map(props: {
    set_cell_count: (n: number) => void,
    resolution: number,
    topo_data: WorldAtlas | null,
    set_is_computing: (b: boolean) => void,
})
{
    const { resolution, topo_data, set_is_computing } = props
    const canvas_ref = useRef<HTMLCanvasElement>(null)

    const draw = useCallback(() => {
        const canvas = canvas_ref.current
        if (!canvas || !props.topo_data) return

        const dpr = window.devicePixelRatio || 1
        const W = canvas.offsetWidth
        const H = canvas.offsetHeight
        if (W === 0 || H === 0) return

        canvas.width = W * dpr
        canvas.height = H * dpr

        const ctx = canvas.getContext("2d")!
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, W, H)

        // ------------------------------------------------------------------
        // Projection: Mercator centred on UK, scale calibrated so the
        // EEZ longitude span (~20°) fills the canvas width.
        // ------------------------------------------------------------------
        // Mercator: pixelsPerDegree = scale * π/180
        // We want lonSpan degrees to span W pixels → scale = W*180/(lonSpan*π)
        const LON_SPAN_DEG = 22 // degrees to show across full width
        const scale = (W * 180) / (LON_SPAN_DEG * Math.PI)
        const projection = geoMercator()
            .center([-2, 56.5])
            .scale(scale)
            .translate([W / 2, H / 2])
            .clipExtent([[0, 0], [W, H]])

        const pathGen = geoPath(projection, ctx)

        // ------------------------------------------------------------------
        // Background ocean
        // ------------------------------------------------------------------
        const grad = ctx.createLinearGradient(0, 0, 0, H)
        grad.addColorStop(0, "#0a1628")
        grad.addColorStop(1, "#0d2241")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)

        // ------------------------------------------------------------------
        // World land (all countries, muted)
        // ------------------------------------------------------------------
        const countries_geo = feature(props.topo_data, props.topo_data.objects.countries)
        if (countries_geo.type === "FeatureCollection")
        {
            for (const f of countries_geo.features)
            {
                const id = String(f.id)
                ctx.beginPath()
                pathGen(f as GeoPermissibleObjects)
                if (id === UK_ID) {
                    ctx.fillStyle = "#1e4976"
                } else if (id === IRELAND_ID) {
                    ctx.fillStyle = "#1a3d5c"
                } else if (id === FRANCE_ID) {
                    ctx.fillStyle = "#1a3552"
                } else if (NEARBY_COUNTRY_IDS.has(id)) {
                    ctx.fillStyle = "#162e47"
                } else {
                    ctx.fillStyle = "#122236"
                }
                ctx.fill()
                ctx.strokeStyle = "#1e3d5a"
                ctx.lineWidth = 0.4
                ctx.stroke()
            }

            // Stronger outlines for nearby countries
            for (const f of countries_geo.features)
            {
                const id = String(f.id)
                if (!NEARBY_COUNTRY_IDS.has(id)) continue
                ctx.beginPath()
                pathGen(f as GeoPermissibleObjects)
                ctx.strokeStyle = id === UK_ID ? "#4a9eda" : id === IRELAND_ID ? "#2e7aaa" : "#245b80"
                ctx.lineWidth = id === UK_ID ? 1.5 : 0.8
                ctx.stroke()
            }
        }

        // ------------------------------------------------------------------
        // EEZ boundary
        // ------------------------------------------------------------------
        const eezCoords = UK_EEZ_COORDS.map(([lat, lng]) => [lng, lat]) as [number,number][]
        ctx.beginPath()
        const first = projection(eezCoords[0]!)
        if (first)
        {
            ctx.moveTo(first[0], first[1])
            for (let i = 1; i < eezCoords.length; i++)
            {
                const pt = projection(eezCoords[i]!)
                if (pt) ctx.lineTo(pt[0], pt[1])
            }
        }
        ctx.closePath()
        ctx.strokeStyle = "rgba(100,200,255,0.45)"
        ctx.lineWidth = 1.2
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // ------------------------------------------------------------------
        // H3 hexagons
        // ------------------------------------------------------------------
        set_is_computing(true)
        const cells = h3.polygonToCells(UK_EEZ_COORDS, resolution)
        props.set_cell_count(cells.length)

        // Draw hexagons in two passes: fill then stroke
        const hexPaths: Path2D[] = []
        for (const cell of cells) {
            const boundary = h3.cellToBoundary(cell) // [[lat,lng],...]
            const p = new Path2D()
            let moved = false
            for (const [lat, lng] of boundary) {
                const pt = projection([lng, lat])
                if (!pt) continue
                if (!moved)
                {
                    moved = true
                    p.moveTo(pt[0], pt[1])
                }
                else p.lineTo(pt[0], pt[1])
            }
            p.closePath()
            hexPaths.push(p)
        }

        // Fill pass
        ctx.fillStyle = "rgba(64,190,230,0.10)"
        for (const p of hexPaths) {
            ctx.fill(p)
        }

        // Stroke pass
        ctx.strokeStyle = "rgba(64,190,230,0.55)"
        ctx.lineWidth = resolution <= 2 ? 1.5 : resolution <= 4 ? 0.8 : 0.4
        hexPaths.forEach(p => ctx.stroke(p))

        set_is_computing(false)
    }, [topo_data, resolution])

    // Redraw when data or resolution changes
    useEffect(() => {
        draw()
    }, [draw])

    // Redraw on resize
    useEffect(() => {
        const ro = new ResizeObserver(() => draw())
        if (canvas_ref.current) ro.observe(canvas_ref.current)
        return () => ro.disconnect()
    }, [draw])


    return <>
        {/* <H3Map
            EEZ_coords={UK_EEZ_COORDS}
            set_cell_count={props.set_cell_count}
            resolution={props.resolution}
            set_is_computing={props.set_is_computing}
        /> */}
    </>
}


// Legend
// <div className="absolute top-4 right-4 bg-[#0a1628]/90 border border-[#1e3d5a] rounded-lg p-3 text-xs space-y-1.5 backdrop-blur-sm">
//     <div className="flex items-center gap-2">
//         <span className="w-4 h-3 rounded-[2px] bg-[#1e4976] border border-[#4a9eda]/60 inline-block"/>
//         <span className="text-[#7ab8d8]">United Kingdom</span>
//     </div>
//     <div className="flex items-center gap-2">
//         <span className="w-4 h-3 rounded-[2px] bg-[#1a3d5c] border border-[#2e7aaa]/60 inline-block"/>
//         <span className="text-[#7ab8d8]">Ireland</span>
//     </div>
//     <div className="flex items-center gap-2">
//         <span className="w-4 h-3 rounded-[2px] bg-[#1a3552] border border-[#245b80]/60 inline-block"/>
//         <span className="text-[#7ab8d8]">France / Benelux</span>
//     </div>
//     <div className="flex items-center gap-2">
//         <span className="w-4 h-3 rounded-[2px] bg-[#40bee6]/20 border border-[#40bee6]/60 inline-block"/>
//         <span className="text-[#7ab8d8]">H3 cells (EEZ)</span>
//     </div>
//     <div className="flex items-center gap-2">
//         <span
//             className="w-4 h-0 border-t border-dashed border-[#64c8ff]/50 inline-block"
//         />
//         <span className="text-[#7ab8d8]">EEZ boundary</span>
//     </div>
// </div>
