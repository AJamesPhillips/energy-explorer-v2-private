import type { XY } from "../../dev/projection"
import type { DemandByH3R4Cell, MWGenCapStoreForH3R4, ValueByPowerType } from "../../model/interface"
import type { H3R4ID } from "../../simple_sim/interface"


export type InfoSectionId =
    "map"
    | "population"
    | "power_demand"
    | "power_supply"
    | "motivation"
    | "oil_and_gas_data"
    | "solar_farms_data"
    | "wind_farms_data"


export interface PublishableEvents
{
    animation_tick: {
        delta_seconds: number
        elapsed_seconds: number
    }
    simulation_datetime: {
        datetime: Date
        datetime_ms: number
        datetime_annual_hourly_index1: number
        datetime_annual_hourly_index2: number
        datetime_annual_hourly_index_mix: number
    }
    simulation_speed_changed: {
        speed: "paused" | "normal" | "fast"
        factor: number
        sim_seconds_per_real_second: number
    }
    power_supply_and_demand: {
        supply_GW: number
        supply_GW_by_type: ValueByPowerType<number>
        capacity_GW_by_type: ValueByPowerType<number>
        gen_cap_store_MW_by_h3r4: Record<string, MWGenCapStoreForH3R4>
        demand_GW: number
        demand_GW_by_h3r4: DemandByH3R4Cell
        h3r4_cell_to_xy: Map<string, XY>
        datetime_ms?: number
    }
    show_message: {
        id?: string
        message: string
        show_for_seconds?: number
        clear_id?: string
    }
    clear_message: {
        id: string
    }
    show_info_and_data_sources: InfoSectionId | true
    show_select_country: undefined

    on_hover_tile: H3R4ID | null
    on_click_tile: H3R4ID
    // on_highlight_oil_reserves: CellDataV2 | null
    // will_update_tile: CellDataV2 | null
    // tile_changed: { tile: CellDataV2; change_gw: number }
    // invalid_placement: {
    //     tile: CellDataV2
    //     item_type: BuildingActionTypeString
    //     invalid_because: "water" | "no_oilgas"
    // }
}
