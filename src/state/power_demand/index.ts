
import { SetAppState } from "../interface"
import { PowerDemandState } from "./interface"


export function initial_state(_: SetAppState): PowerDemandState
{
    return {
        electricity_demand_gw: 40,
        gas_demand_gw: 0,
        petrol_demand_gw: 0,
        diesel_demand_gw: 0,
        jet_fuel_demand_gw: 0,
        heating_oil_demand_gw: 0,
    }
}
