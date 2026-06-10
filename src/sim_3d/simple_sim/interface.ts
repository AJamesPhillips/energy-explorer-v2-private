import { LandOrSea } from "../data/coverage_land/uk/data"


export type CellData = LandOrSea &
{
    id: number
    x: number
    y: number
    has_wind_turbine: boolean
    has_solar_farm: boolean
    has_oil_rig: OilRigConfig
    has_oil_pocket: OilGasPocket
    oil_gas_ratio_remaining?: number
    // has_hydro: boolean
    // altitude_m: number
}

export interface CellsData<E extends CellData = CellData>
{
    [x: number]: {
        [y: number]: E
    }
}

export type OilGasPocket = { ratio_remaining: number } | undefined
export type OilRigState = "extracting" | "dormant" | "building" | "decommissioning"
export type OilRigConfig = { state: OilRigState, built_progress: number } | undefined
