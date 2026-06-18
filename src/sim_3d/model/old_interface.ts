import type { IDataMap } from "core/data/values/DataMap"
import type { IDataSeries } from "core/data/values/DataSeries"
import type {
    DatetimeRangeLatLonKey,
    DatetimeRangeLatLonMultipleKeys,
} from "core/data/values/datetime_lat_lon"
import type { DatetimeRange } from "core/data/values/DatetimeRange"
import type { ILatLon, ILatLonWithIsOnshore } from "core/data/values/LatLon"


export interface PowerStats
{
    demand_gw: number
    supply_gw: number
}


export interface PowerPlant
{
    name: string
    installed_mw_capacity: number
}

export interface StoragePowerPlant extends PowerPlant
{
    storage_capacity_mwh: number
    stored_mwh: number
}

export interface UserChoices
{
    chosen_region: string
    wind_mw_power_plants: IDataMap<ILatLonWithIsOnshore, PowerPlant>
    solar_mw_power_plants: IDataMap<ILatLon, PowerPlant>
    storage_mw_power_plants: IDataMap<ILatLon, StoragePowerPlant>
}

export type TemporalSpatialDataSeries = IDataSeries<DatetimeRangeLatLonKey, number, DatetimeRangeLatLonMultipleKeys>

export interface ModelData
{
    region_name: string
    datetime_range: DatetimeRange
    onshore_lat_lons: ILatLonWithIsOnshore[]
    offshore_lat_lons: ILatLonWithIsOnshore[]
    hourly_electricity_demand_mw: IDataSeries<number, number>
    hourly_capacity_factor_wind_generation: { onshore: TemporalSpatialDataSeries, offshore: TemporalSpatialDataSeries }
    hourly_capacity_factor_solar_generation: TemporalSpatialDataSeries
}

export interface ModelScenario
{
    datetime_range: DatetimeRange
}


export interface ModelRunOutput
{
    model_datetime_steps: Date[]
    hourly_electricity_demand_mw: number[]
    hourly_wind_generation_mw: number[]
    hourly_solar_generation_mw: number[]
    hourly_total_generation_mw: number[]
    /**
     * Net generation is total generation minus electricity demand.
     * It does not include storage.
     */
    hourly_net_generation_mw: number[]
    /**
     * Net supply is net generation plus storage provided, or minus stored electricity.
     * It is the total supply available to the grid (excluding storage when they
     * are charging, i.e. are sinks of electricity).
     */
    hourly_net_supply_mw: number[]
}
