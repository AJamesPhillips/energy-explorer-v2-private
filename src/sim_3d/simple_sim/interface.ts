import { LandOrSea } from "../data/coverage_land/uk/data"


export type CellDataV2 =
{
    h3_id: string
    // x: number
    // y: number
    // has_wind_turbine: boolean
    // has_solar_farm: boolean
    // has_oil_rig: OilRigConfig
    // has_oil_pocket: OilGasPocket
    // oil_gas_ratio_remaining?: number
    // has_hydro: boolean
    // altitude_m: number
}


export type CellDataV1 = LandOrSea &
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

export interface CellsData<E extends CellDataV1 = CellDataV1>
{
    [x: number]: {
        [y: number]: E
    }
}

export type OilGasPocket = { ratio_remaining: number } | undefined
export type OilRigState = "extracting" | "dormant" | "building" | "decommissioning"
export type OilRigConfig = { state: OilRigState, built_progress: number } | undefined
