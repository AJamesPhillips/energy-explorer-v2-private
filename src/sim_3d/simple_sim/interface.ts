import { LandOrSea } from "../data/land_coverage/uk/data"


export type CellData = LandOrSea &
{
    id: number
    x: number
    y: number
    has_wind_turbine: boolean
    has_solar_farm: boolean
    has_oil_rig: OilRigConfig | undefined
    has_oil_pocket: boolean | undefined
    // has_hydro: boolean
    // altitude_m: number
}

export interface CellsData<E extends CellData = CellData>
{
    [x: number]: {
        [y: number]: E
    }
}


export type OilRigState = "extracting" | "dormant"
export type OilRigConfig = { state: OilRigState }
