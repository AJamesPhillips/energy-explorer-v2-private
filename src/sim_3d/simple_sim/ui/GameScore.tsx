import { get_app_state } from "../../../state/store"
import { cost_per_km2_solar, cost_per_km2_wind, cost_per_nuclear_plant } from "../../data/cost"
import { AggregatedPowerPlantData, AggregatePowerPlantData } from "../../data/power_plants/interface"


export function GameScore()
{
    const aggregated_by_h3r4 = get_app_state(state => state.power_plants.aggregated_by_h3r4)

    const score = calculate_score(aggregated_by_h3r4)

    return <div className="ui_section">
        <div><b>Score</b> {Math.round(score.total_score)}</div>
        <div>Building cost: {to_neg(score.building_cost)}</div>
        <div>Shortfall: {to_neg(score.shortfall)}</div>
        <div>Resilience: {to_neg(score.resilience_score)}</div>
        <div>Running cost: {to_neg(score.running_cost)}</div>
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
    shortfall: number
    running_cost: number
    resilience_score: number
    total_score: number
}
function calculate_score(aggregated_by_h3r4: Record<string, AggregatedPowerPlantData> | undefined): Score
{
    let building_cost = 0

    Object.values(aggregated_by_h3r4 || {}).forEach(cell =>
    {
        const wind_area_built_km2 = area_built(cell.wind)
        const solar_area_built_km2 = area_built(cell.solar)
        const nuclear_plants_built = cell.nuclear.count - (cell.nuclear.starting_count ?? 0)

        building_cost += wind_area_built_km2 * cost_per_km2_wind
        building_cost += solar_area_built_km2 * cost_per_km2_solar
        building_cost += nuclear_plants_built * cost_per_nuclear_plant
    })

    const total_score = 100 - building_cost

    return {
        shortfall: 0,
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
