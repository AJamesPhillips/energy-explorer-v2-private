import { IDataMap } from "core/data/values/DataMap"
import { DatetimeRange } from "core/data/values/DatetimeRange"
import { ILatLon } from "core/data/values/LatLon"
import { factory_change_date } from "core/utils/datetime"

import { ModelData, ModelRunOutput, ModelScenario, StoragePowerPlant, UserChoices } from "./old_interface"


export function run_model(model_data: ModelData, model_scenario: ModelScenario, user_actions: UserChoices): ModelRunOutput
{
    const { datetime_range } = model_data
    const timestamps = datetime_range.get_entries()
    let current_datetime_index = datetime_range.get_index_of(model_scenario.datetime_range.start.getTime())

    // Get the last datetime index in the model_data.datetime_range given the
    // model_scenario.datetime_range.end
    const change_datetime_minus_1 = DatetimeRange.factory_change_date(datetime_range.repeat_every!, -1)
    const end_datetime = new Date(model_scenario.datetime_range.end)
    change_datetime_minus_1(end_datetime)
    const end_datetime_index = datetime_range.get_index_of(end_datetime.getTime())

    const model_datetime_steps: Date[] = []
    const hourly_electricity_demand_mw: number[] = []
    const hourly_wind_generation_mw: number[] = []
    const hourly_solar_generation_mw: number[] = []
    const hourly_total_generation_mw: number[] = []
    const hourly_net_generation_mw: number[] = []
    const hourly_net_supply_mw: number[] = []

    const {
        hourly_capacity_factor_wind_generation: {
            onshore: onshore_wind_generation,
            offshore: offshore_wind_generation,
        },
        hourly_capacity_factor_solar_generation: solar_generation
    } = model_data

    const change_datetime_plus_1 = factory_change_date(datetime_range.repeat_every!, 1)
    while (current_datetime_index <= end_datetime_index)
    {
        const current_date = timestamps[current_datetime_index]!
        const current_datetime_ms = current_date.getTime()
        model_datetime_steps.push(current_date)

        const electricity_demand_mw = model_data.hourly_electricity_demand_mw.get(current_datetime_ms)!
        hourly_electricity_demand_mw.push(electricity_demand_mw)
        let wind_generation_mw = 0
        let solar_generation_mw = 0

        user_actions.wind_mw_power_plants.get_entries().forEach(([lat_lon, power_plant]) =>
        {
            wind_generation_mw += (lat_lon.is_onshore
                ? (onshore_wind_generation.get({ datetime_ms: current_datetime_ms, lat_lon })! * power_plant.installed_mw_capacity)
                : (offshore_wind_generation.get({ datetime_ms: current_datetime_ms, lat_lon })! * power_plant.installed_mw_capacity))
        })

        user_actions.solar_mw_power_plants.get_entries().forEach(([lat_lon, power_plant]) =>
        {
            solar_generation_mw += (solar_generation.get({ datetime_ms: current_datetime_ms, lat_lon })! * power_plant.installed_mw_capacity)
        })

        hourly_wind_generation_mw.push(wind_generation_mw)
        hourly_solar_generation_mw.push(solar_generation_mw)
        const total_generation_mw = wind_generation_mw + solar_generation_mw
        hourly_total_generation_mw.push(total_generation_mw)
        const net_generation_mw = total_generation_mw - electricity_demand_mw
        hourly_net_generation_mw.push(net_generation_mw)

        const next_date = new Date(current_date)
        change_datetime_plus_1(next_date) // mutate next date
        const time_step_seconds = (next_date.getTime() - current_datetime_ms) / 1000
        const storage_provided_mw = calc_storage_provided_mw(user_actions.storage_mw_power_plants, net_generation_mw, time_step_seconds)
        const net_supply = net_generation_mw + storage_provided_mw
        hourly_net_supply_mw.push(net_supply)

        ++current_datetime_index
    }


    return {
        model_datetime_steps,
        hourly_electricity_demand_mw,
        hourly_wind_generation_mw,
        hourly_solar_generation_mw,
        hourly_total_generation_mw,
        hourly_net_generation_mw,
        hourly_net_supply_mw,
    }
}


function calc_storage_provided_mw(storage_power_plants: IDataMap<ILatLon, StoragePowerPlant>, net_generation_mw: number, time_step_seconds: number): number
{
    let exercisable_storage_mwh = 0
    storage_power_plants.get_entries().forEach(([_, power_plant]) =>
    {
        exercisable_storage_mwh += (net_generation_mw >= 0
            ? power_plant.storage_capacity_mwh - power_plant.stored_mwh
            : power_plant.stored_mwh)
    })

    const time_step_hours = time_step_seconds / 3600
    return exercisable_storage_mwh / time_step_hours // convert to MW
}
