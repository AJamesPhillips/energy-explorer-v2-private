
// Ultra-simplification of UK grid
// UK 400 kV grid
// V = 400 kV
// I = 4 kA
// cosϕ = 1  (ϕ = phase angle between voltage and current)
// P = 3**0.5 * V * I * cosϕ
// P = 3**0.5 * 400000 * 4000 * 1 = 2.8 GW
const POWER_PER_LINE = 2.8e9

// const UK_400KV_GRID = {

// A initial first pass at a simplified graph of the UK's electrical grid.
// It uses the H3 resolution 4 grid
// Every cell either has 1 or more power pylons
