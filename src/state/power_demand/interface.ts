import { DemandGWForH3R4 } from "../../sim_3d/model/interface"

export interface PowerDemandState
{
    initial_electricity_demand_GW_by_h3r4: Record<string, DemandGWForH3R4> | undefined
    // electricity_demand_gw: number
    // gas_demand_gw: number
    // petrol_demand_gw: number
    // diesel_demand_gw: number
    // jet_fuel_demand_gw: number
    // heating_oil_demand_gw: number
}
