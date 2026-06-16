import { CapacityFactorData, load_capacity_factor_data } from "../../utils/capacity_factor_data"


export async function load_wind_turbine_capacity_data(): Promise<CapacityFactorData>
{
    return load_capacity_factor_data("data/wind_turbine_capacity/_2019_uk_h3_res4.csv")
}

export async function load_solar_pv_capacity_data(): Promise<CapacityFactorData>
{
    return load_capacity_factor_data("data/solar_pv_capacity/_2019_uk_h3_res4.csv")
}
