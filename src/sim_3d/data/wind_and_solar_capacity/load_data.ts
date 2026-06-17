import { aggregate_to_annual_average, CapacityFactorData, load_capacity_factor_data } from "../../utils/capacity_factor_data"


export async function load_all_capacity_factor_data(): Promise<{
    wind: CapacityFactorData,
    annual_wind: CapacityFactorData,
    solar: CapacityFactorData,
    annual_solar: CapacityFactorData,
}>
{
    const wind_turbine_capacity_data = await load_wind_turbine_capacity_data()
    const solar_pv_capacity_data = await load_solar_pv_capacity_data()

    const annual_wind = aggregate_to_annual_average(wind_turbine_capacity_data)
    const annual_solar = aggregate_to_annual_average(solar_pv_capacity_data)

    return {
        wind: wind_turbine_capacity_data,
        annual_wind,
        solar: solar_pv_capacity_data,
        annual_solar,
    }
}

export async function load_wind_turbine_capacity_data(): Promise<CapacityFactorData>
{
    return load_capacity_factor_data("data/wind_turbine_capacity/_2019_uk_h3_res4.csv")
}

export async function load_solar_pv_capacity_data(): Promise<CapacityFactorData>
{
    return load_capacity_factor_data("data/solar_pv_capacity/_2019_uk_h3_res4.csv")
}
