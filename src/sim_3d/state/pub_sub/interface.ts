import { BuildingActionTypeString } from "../../../state/building_action/interface"
import { CellData } from "../../simple_sim/interface"


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

    on_hover_tile: CellData | null
    on_highlight_oil_reserves: { x: number, y: number } | null
    will_update_tile: CellData | null
    tile_power_changed: { tile: CellData; change_gw: number }
    invalid_placement: {
        tile: CellData
        item_type: BuildingActionTypeString
        invalid_because: "water" | "no_oilgas"
    }
}
