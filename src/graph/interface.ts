import { DataComponentExtended } from "../data/interface"


export type NodeDifference = { absolute: number, relative: number } | undefined | false

export interface GraphForRendering
{
    component: DataComponentExtended
    diff: NodeDifference
    children: GraphForRendering[]
    alternative: DataComponentExtended | undefined
}


export interface VisibleNode
{
    graph: GraphForRendering
    children: VisibleNode[]
    /** Number of graph children not shown due to display_width limit or being in agreement. */
    hidden_count: number
}

export interface PlacedNode
{
    /** null when this is an overflow placeholder ("show N more"). */
    graph: GraphForRendering | null
    diff: NodeDifference
    hidden_count: number
    /** Centre-x in SVG coordinate space. */
    cx: number
    /** Top-y in SVG coordinate space. */
    y: number
    parent_cx: number | null
    parent_bottom: number | null
}
