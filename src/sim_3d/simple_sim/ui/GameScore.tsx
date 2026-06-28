import { useCallback, useEffect, useState } from "react"

import { deep_copy } from "core/utils/deep_copy"

import { get_app_state } from "../../../state/store"
import { cost_per_km2_solar, cost_per_km2_wind, cost_per_nuclear_plant } from "../../data/cost"
import { AggregatedPowerPlantData, AggregatePowerPlantData } from "../../data/power_plants/interface"
import { calculate_model_state_over_time_range } from "../../model"
import { ModelStateAtTimepoint } from "../../model/interface"


export function GameScore()
{
    const initial_electricity_demand_GW_by_h3r4 = get_app_state(state => state.power_demand.initial_electricity_demand_GW_by_h3r4)
    const start_timestamp = get_app_state(state => state.game_datetime.start_timestamp)
    const end_timestamp = get_app_state(state => state.game_datetime.end_timestamp)
    const aggregated_power_plants_by_h3r4 = get_app_state(state => state.power_plants.aggregated_by_h3r4)
    const [score, set_score] = useState<Score>()

    const recalculate_score = useCallback(async () =>
    {
        if (!initial_electricity_demand_GW_by_h3r4 || !aggregated_power_plants_by_h3r4) return

        const demand_GW_by_h3r4 = deep_copy(initial_electricity_demand_GW_by_h3r4)

        const model_state_over_time = await calculate_model_state_over_time_range({
            demand_GW_by_h3r4,
            start_timestamp,
            end_timestamp,
        })
        const score = calculate_score(model_state_over_time, aggregated_power_plants_by_h3r4)
        set_score(score)
    }, [initial_electricity_demand_GW_by_h3r4, aggregated_power_plants_by_h3r4, start_timestamp, end_timestamp])

    useEffect(() =>
    {
        recalculate_score()
    }, [recalculate_score, aggregated_power_plants_by_h3r4])


    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <button
            className="ui_button"
            onClick={() => recalculate_score()}
        >
            {score ? "Recalculate Score" : "Calculate Score"}
        </button>

        {score && <div className="ui_section">
            <div><b>Score</b> {Math.round(score.total_score)}</div>
            <div>Building cost: {to_neg(score.building_cost)}</div>
            <div>Shortage: {to_neg(score.shortage_GWh)}</div>
            <div>Excess: {to_neg(score.excess_GWh)}</div>
            <div>Resilience: {to_neg(score.resilience_score)}</div>
            <div>Running cost: {to_neg(score.running_cost)}</div>
        </div>}
    </div>
}
function to_neg(value: number)
{
    let value_str = value ? value.toFixed(1) : "0"
    if (value > 0) value_str = "-" + value_str
    return value_str
}


interface Score
{
    building_cost: number
    shortage_GWh: number
    excess_GWh: number
    running_cost: number
    resilience_score: number
    total_score: number
}
function calculate_score(model_state_over_time: ModelStateAtTimepoint[], aggregated_power_plants_by_h3r4: Record<string, AggregatedPowerPlantData>): Score
{
    let building_cost = 0

    Object.values(aggregated_power_plants_by_h3r4).forEach(cell =>
    {
        const wind_area_built_km2 = area_built(cell.wind)
        const solar_area_built_km2 = area_built(cell.solar)
        const nuclear_plants_built = cell.nuclear.count - (cell.nuclear.starting_count ?? 0)

        building_cost += wind_area_built_km2 * cost_per_km2_wind
        building_cost += solar_area_built_km2 * cost_per_km2_solar
        building_cost += nuclear_plants_built * cost_per_nuclear_plant
    })

    // Shortage & excess
    let shortage_GWh = 0
    let excess_GWh = 0
    model_state_over_time.forEach(model_state =>
    {
        // Each timepoint is one hour so the shortfall in GWh is the same as the
        // shortfall in GW
        // Also the demand factors in demand from storage like pumped hydro,
        // batteries, compressed air, etc.
        const diff_GWh = model_state.generated_GW - model_state.demand_GW
        shortage_GWh += Math.max(0, -diff_GWh)
        excess_GWh += Math.max(0, diff_GWh)
    })

    const total_score = 100 - building_cost

    return {
        shortage_GWh,
        excess_GWh,
        building_cost,
        running_cost: 0,
        resilience_score: 0,
        total_score,
    }
}


function area_built(wind_or_solar: AggregatePowerPlantData)
{
    return (wind_or_solar.area_km2 ?? 0) - (wind_or_solar.starting_area_km2 ?? 0)
}
