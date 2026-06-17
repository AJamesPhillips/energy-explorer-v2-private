import { useEffect, useState } from "react"

import { UK_EEZ_COORDS } from "../data/eez/data"
import { load_solar_pv_capacity_data, load_wind_turbine_capacity_data } from "../data/wind_and_solar_capacity/load_data"
import { H3Grid } from "../dev/dgg/H3Grid"
import { CapacityFactorData, aggregate_to_annual_average } from "../utils/capacity_factor_data"



export function WindSolarH3Grid()
{
    const [wind_turbine_capacity_data, set_wind_turbine_capacity_data] = useState<CapacityFactorData | null>(null)
    const [annual_wind_turbine_capacity_data, set_annual_wind_turbine_capacity_data] = useState<CapacityFactorData | null>(null)
    const [solar_pv_capacity_data, set_solar_pv_capacity_data] = useState<CapacityFactorData | null>(null)
    const [annual_solar_pv_capacity_data, set_annual_solar_pv_capacity_data] = useState<CapacityFactorData | null>(null)
    useEffect(() =>
    {
        load_wind_turbine_capacity_data().then(wind_turbine_capacity_data =>
        {
            set_wind_turbine_capacity_data(wind_turbine_capacity_data)
            const annual = aggregate_to_annual_average(wind_turbine_capacity_data)
            // const annual = get_ombre_of_capacity_factors(wind_turbine_capacity_data)
            set_annual_wind_turbine_capacity_data(annual)
        })

        load_solar_pv_capacity_data().then(solar_pv_capacity_data =>
        {
            set_solar_pv_capacity_data(solar_pv_capacity_data)
            const annual = aggregate_to_annual_average(solar_pv_capacity_data)
            set_annual_solar_pv_capacity_data(annual)
        })
    }, [])

    return <H3Grid
        EEZ_coords_lonlat={UK_EEZ_COORDS}
        resolution={4}
        // set_cell_count={set_cell_count}
        capacity_data={{ data: wind_turbine_capacity_data, type: "wind", display_type: "continuous" }}
        // capacity_data={{ data: annual_wind_turbine_capacity_data, type: "wind" }}
        // capacity_data={{ data: solar_pv_capacity_data, type: "solar", display_type: "continuous" }}
        // capacity_data={{ data: annual_solar_pv_capacity_data, type: "solar" }}
    />
}
