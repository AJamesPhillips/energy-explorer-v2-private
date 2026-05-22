
// export const NODE_W = 160
// export const NODE_H = 64
// export const H_GAP = 24
// // Vertical gap between bottom of a parent node and top of its children row.
// // This space is used for the connector lines.
// export const V_GAP = 60

export const NODE_W = (compact: boolean) => compact ? 60 : 180
export const NODE_H = (compact: boolean) => compact ? 40 : 90
export const H_GAP = (compact: boolean) => compact ? 10 : 30
export const V_GAP = (compact: boolean) => compact ? 20 : 50
export const NODE_TEXT_SIZE = (compact: boolean) => compact ? 8 : 12
export const NODE_TEXT_SIZE_SMALL = (compact: boolean) => compact ? 6 : 11
export const NODE_TEXT_V_FACTOR = (value: number, compact: boolean) => value * (compact ? 0.6 : 1)
export const SVG_PADDING = 24

export const ARROW_SIZE = 6
