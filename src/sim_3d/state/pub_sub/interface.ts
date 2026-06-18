import type { BuildingActionTypeString } from "../../../state/building_action/interface"
import type { XY } from "../../dev/projection"
import type { DemandByH3R4Cell } from "../../model/interface"
import type { SupplyGWByType } from "../../model/old_interface"
import type { CellDataV2 } from "../../simple_sim/interface"


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
        supply_gw: number
        supply_gw_by_type: SupplyGWByType
        capacity_gw_by_type: SupplyGWByType
        generation_by_cell?: Record<string, {
            h3_id: string
            wind: { generated_mw: number; capacity_mw: number }
            solar: { generated_mw: number; capacity_mw: number }
            gas: { generated_mw: number; capacity_mw: number }
            nuclear: { generated_mw: number; capacity_mw: number }
            total_generated_mw: number
            total_capacity_mw: number
        }>
        demand_gw: number
        demand_by_h3r4: DemandByH3R4Cell
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

    on_hover_tile: CellDataV2 | null
    on_click_tile: CellDataV2 | null
    on_highlight_oil_reserves: CellDataV2 | null
    will_update_tile: CellDataV2 | null
    tile_changed: { tile: CellDataV2; change_gw: number }
    invalid_placement: {
        tile: CellDataV2
        item_type: BuildingActionTypeString
        invalid_because: "water" | "no_oilgas"
    }
}
