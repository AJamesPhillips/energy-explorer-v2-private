import { useEffect, useMemo, useRef, useState } from "react"

import { IdAndVersion } from "core/data/id"

import Loading from "../components/Loading"
import { GraphWithComputedValues, PerspectiveKnowledgeGraph } from "../data/interface"
import { Connector } from "./GraphConnector"
import { GraphNode } from "./GraphNode"
import { GraphForRendering, PlacedNode, VisibleNode } from "./interface"
import { H_GAP, NODE_H, NODE_W, SVG_PADDING, V_GAP } from "./layout_constants"
import { compute_differences } from "./utils"


function build_graph_for_rendering(graph: GraphWithComputedValues, apex_id: IdAndVersion): GraphForRendering
{
    const node = graph.nodes[apex_id.to_str()]
    if (!node) throw new Error(`Node with ID ${apex_id.to_str()} not found in graph`)

    const children = node.children
        .map(c_id => build_graph_for_rendering(graph, c_id))
        // For this graph, most of the interesting differences are hidden off to
        // the right so we reverse the order to show them first.
        .reverse()

    const alternative = node.alternatives && node.alternatives.length > 0
        ? graph.nodes[node.alternatives[0]!.to_str()]?.component
        : undefined

    const component = node.component
    // Set the `multiple_versions` flag
    component.multiple_versions = node.multiple_versions

    const diff = compute_differences(
        component,
        alternative,
    )

    return {
        component,
        diff,
        children,
        alternative,
    }
}


// ─── Graph traversal ───────────────────────────────────────────────────────────

/**
 * Depth-first search for the first node whose component ID matches
 * `component_id` (compared as a string).  Returns null if not found.
 */
function find_graph_node(graph: GraphForRendering, component_id: IdAndVersion): GraphForRendering | null
{
    if (graph.component.id.to_str() === component_id.to_str()) return graph
    for (const child of graph.children)
    {
        const found = find_graph_node(child, component_id)
        if (found !== null) return found
    }
    return null
}

/**
 * Returns the first descendant reached by following the first child at each
 * level for `depth` levels, or the node itself when depth ≤ 0 or there are
 * no children.
 */
function first_descendant_at_depth(graph: GraphForRendering, depth: number): GraphForRendering
{
    if (depth <= 0 || graph.children.length === 0) return graph
    const first_child = graph.children[0]
    if (first_child === undefined) return graph
    return first_descendant_at_depth(first_child, depth - 1)
}

function build_tree(
    graph: GraphForRendering,
    remaining_depth: number,
    max_width: number,
    show_agreements: boolean,
): VisibleNode
{
    if (remaining_depth <= 0)
    {
        return { graph, children: [], hidden_count: 0 }
    }
    const potential_children = show_agreements ? graph.children : graph.children.filter(c => !!c.diff)
    const shown = potential_children.slice(0, max_width)
    const hidden_count = Math.max(0, graph.children.length - shown.length)
    return {
        graph,
        children: shown.map(c => build_tree(c, remaining_depth - 1, max_width, show_agreements)),
        hidden_count,
    }
}


// ─── Layout computation ────────────────────────────────────────────────────────

interface ChildEntry
{
    node: VisibleNode
    width: number
}

function child_entries(compact: boolean, node: VisibleNode): ChildEntry[]
{
    return node.children.map(child => ({ node: child, width: subtree_min_width(compact, child) }))
}

function subtree_min_width(compact: boolean, node: VisibleNode): number
{
    const entries = child_entries(compact, node)
    const extra = node.hidden_count > 0 ? 1 : 0
    const n = entries.length + extra
    if (n === 0) return NODE_W(compact)
    const sum = entries.reduce((s, e) => s + e.width, 0) + extra * NODE_W(compact)
    const total = sum + (n - 1) * H_GAP(compact)
    return Math.max(NODE_W(compact), total)
}

function place_nodes(
    compact: boolean,

    node: VisibleNode,
    cx: number,
    y: number,
    parent_cx: number | null,
    parent_bottom: number | null,
    out: PlacedNode[],
): void
{
    out.push({
        graph: node.graph,
        diff: node.graph.diff,
        hidden_count: 0,
        cx,
        y,
        parent_cx,
        parent_bottom,
    })

    const entries = child_entries(compact, node)
    const extra = node.hidden_count > 0 ? 1 : 0
    const n = entries.length + extra
    if (n === 0) return

    const total_w =
        entries.reduce((s, e) => s + e.width, 0) +
        extra * NODE_W(compact) +
        (n - 1) * H_GAP(compact)

    let x = cx - total_w / 2
    const child_y = y + NODE_H(compact) + V_GAP(compact)
    const this_bottom = y + NODE_H(compact)

    for (const { node: child, width } of entries)
    {
        place_nodes(compact, child, x + width / 2, child_y, cx, this_bottom, out)
        x += width + H_GAP(compact)
    }

    if (node.hidden_count > 0)
    {
        out.push({
            graph: null,
            diff: node.graph.diff,
            hidden_count: node.hidden_count,
            cx: x + NODE_W(compact) / 2,
            y: child_y,
            parent_cx: cx,
            parent_bottom: this_bottom,
        })
    }
}


interface GraphViewerProps
{
    persectives: PerspectiveKnowledgeGraph[]
    // graph: GraphForRendering
    // apex_component_id: number
    // display_depth: number
    // display_width: number
    // start_depth?: number
}
export function GraphViewer(props: GraphViewerProps)
{
    // const { graph, apex_component_id, display_depth, display_width, start_depth = 0 } = props
    const { persectives } = props
    const start_depth = 0

    const graph = persectives[0]?.graph
    const graph_for_rendering = useMemo(() => graph && build_graph_for_rendering(graph, graph.apex_id), [graph])

    const [show_agreements, set_show_agreements] = useState(false)
    const compact = show_agreements

    // const { max_depth: display_depth, max_width: display_width } = graph
    const display_depth = 100
    const display_width = 100


    const container_ref = useRef<HTMLDivElement>(null)
    const [container_w, set_container_w] = useState(800)

    useEffect(() =>
    {
        const el = container_ref.current
        if (!el) return

        const update_width = (w: number) =>
        {
            if (w > 0) set_container_w(w)
        }

        update_width(el.getBoundingClientRect().width)

        const observer = new ResizeObserver(entries =>
        {
            const w = entries[0]?.contentRect.width
            if (w !== undefined) update_width(w)
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])


    const tree_w_ref = useRef(0)
    const [_, refresh] = useState({})


    if (!graph || !graph_for_rendering) return <Loading />


    // Locate the requested apex node inside the graph, falling back to root.
    const apex = find_graph_node(graph_for_rendering, graph.apex_id) ?? graph_for_rendering

    // If start_depth > 0, descend into the graph before rendering.
    const display_root = first_descendant_at_depth(apex, start_depth)

    // Build the truncated visible tree and compute all node positions.
    const visible = build_tree(display_root, display_depth, display_width, show_agreements)
    const tree_w = subtree_min_width(compact, visible)

    // Clear and remount if the tree width changes, to avoid svg size being
    // kept larger than necessary
    if (tree_w_ref.current !== tree_w)
    {
        setTimeout(() =>
        {
            tree_w_ref.current = tree_w
            refresh({})
        }, 0)
        return null
    }

    // Centre the tree within whichever is wider: the tree itself or the container.
    const content_w = Math.max(tree_w, container_w - 2 * SVG_PADDING)
    const apex_cx = content_w / 2 + SVG_PADDING

    const placed: PlacedNode[] = []
    place_nodes(compact, visible, apex_cx, SVG_PADDING, null, null, placed)

    const svg_w = content_w + 2 * SVG_PADDING
    const max_node_bottom = placed.reduce((m, n) => Math.max(m, n.y + NODE_H(compact)), NODE_H(compact))
    const svg_h = max_node_bottom + SVG_PADDING

    return (
        <div ref={container_ref} id="graph_viewer">
            <div
                style={{
                    position: "fixed",
                    top: 30,
                    left: 0,
                    right: 0,
                    pointerEvents: "none",
                    textAlign: "center",
                }}
            >
                <button onClick={() => set_show_agreements(s => !s)} style={{ pointerEvents: "auto" }}>
                    {show_agreements ? "Hide agreements" : "Show agreements"}
                </button>
            </div>

            <svg
                width={svg_w}
                height={svg_h}
                style={{ display: "block" }}
                xmlns="http://www.w3.org/2000/svg"
            >
                {placed.map((node, i) =>
                    node.parent_cx !== null && node.parent_bottom !== null
                        ? <Connector
                            key={`conn-${i}`}
                            parent_cx={node.parent_cx}
                            parent_bottom={node.parent_bottom}
                            child_cx={node.cx}
                            child_top={node.y}
                        />
                        : null
                )}
                {placed.map((node, i) =>
                    <GraphNode
                        key={`node-${i}`}
                        node={node}
                        compact={compact}
                        set_show_agreements={set_show_agreements}
                    />
                )}
            </svg>
        </div>
    )
}
