import { CellDataV2 } from "../interface"


export interface Popup
{
    id: number
    tile: CellDataV2
    change_gw: number
}


export const CONSTANTS =
{
    DURATION_S: 2.0,
    FLOAT_HEIGHT: 1.5,
}
