
import { DataSeries } from "core/data/values/DataSeries"

import { datetime_range_2018_hourly } from "../../data/_2018"
import { uk_demand_gw_by_hour_2018 } from "../../data/power_demand/uk"
import { uk_hourly_capacity_factor_solar_generation_2018 } from "../../data/power_generation/solar_pv"
import { uk_hourly_capacity_factor_wind_generation_2018 } from "../../data/power_generation/wind_turbine"
import { get_spatial_data_grid } from "../../data/spatial_grid/uk"
import { ModelData } from "../../model/old_interface"


let async_model_data: Promise<ModelData> | undefined = undefined
export async function load_model_data(): Promise<ModelData>
{
    if (async_model_data) return async_model_data

    async_model_data = new Promise<ModelData>(async (resolve) =>
    {

        const { onshore_lat_lons, offshore_lat_lons } = await get_spatial_data_grid()

        const hourly_electricity_demand_mw = new DataSeries<number, number>(
            uk_demand_gw_by_hour_2018.map(v => v * 1000), // Convert from GW to MW
            {
                validate: data_count =>
                {
                    if (data_count !== datetime_range_2018_hourly.size()) return [`DataSeries length ${data_count} must match the datetime range size ${datetime_range_2018_hourly.size()}`]
                    return []
                },
                get_index: datetime_range_2018_hourly.get_index_of.bind(datetime_range_2018_hourly),
            },
        )
        const hourly_capacity_factor_solar_generation = await uk_hourly_capacity_factor_solar_generation_2018()
        const hourly_capacity_factor_wind_generation = await uk_hourly_capacity_factor_wind_generation_2018()

        resolve({
            region_name: "UK",
            datetime_range: datetime_range_2018_hourly,
            onshore_lat_lons,
            offshore_lat_lons,
            hourly_electricity_demand_mw,
            hourly_capacity_factor_wind_generation,
            hourly_capacity_factor_solar_generation,
        })
    })

    return async_model_data
}
