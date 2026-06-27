

/**
 * Returns the factor by which PV capacity changes with temperature. For example,
 * if the temperature is 30C, the factor is currently 0.02 i.e. 2% decrease in
 * PV capacity from its nameplate AKA its rated capcity.
 * @param args
 *      * pv_capacity_watts - can be in watts, kW, MW, GW etc.
 *      * temperature_celsius
 * @returns number
 */
export function change_in_pv_capacity_with_temperature(args: { pv_capacity_watts: number, temperature_celsius: number }): number
{
    return args.pv_capacity_watts * pv_capacity_change_factor_with_temperature(args.temperature_celsius)
}

const min_change_per_degree_celsius = -0.003
const max_change_per_degree_celsius = -0.005
const mean_change_per_degree_celsius = (min_change_per_degree_celsius + max_change_per_degree_celsius) / 2
const change_above_celcius = 25
function pv_capacity_change_factor_with_temperature(temperature_celsius: number): number
{
    // https://pureskyenergy.com/news-community/articles/how-heat-affects-solar-energy-production/
    // Citing EnergySage, 2024; NREL, 2020
    if (temperature_celsius <= change_above_celcius) return 1

    const delta_celsius = temperature_celsius - change_above_celcius
    const change_factor = 1 + (delta_celsius * mean_change_per_degree_celsius)
    return change_factor
}
