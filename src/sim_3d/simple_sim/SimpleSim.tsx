import { Canvas } from "@react-three/fiber"
import { useEffect, useState } from "react"

// import uk_daily_power_demand_profiles from "../data/power_demand/uk/daily_profiles.json"
// import { uk_month_hourly_and_location_average_capacity_factor_solar_generation_2018 } from "../data/power_generation/solar_pv"
// import { uk_month_hourly_and_location_average_capacity_factor_wind_generation_2018 } from "../data/power_generation/wind_turbine"
import { PerspectiveKnowledgeGraph } from "../../data/interface"
import { PowerStats } from "../model/old_interface"
import { Footer } from "./footer/Footer"
import { InitialiseGeometriesEtc } from "./InitialiseGeometriesEtc"
import { CellsData } from "./interface"
import { map_data_cells } from "./map_data"
import { PowerStatus } from "./PowerStatus"
import { SimpleSim3d } from "./SimpleSim3d"
import { WelcomeMessage1, WelcomeMessage2 } from "./WelcomeMessage"


const hours_per_day = 24
// TODO: move this into WikiSim
function convert_kwh_pd_pp_to_gw(args: { kwh_per_day_per_person: number, population: number })
{
    const kwh_per_day = args.kwh_per_day_per_person * args.population
    const kw = kwh_per_day / hours_per_day
    return kw / 1e6
}


export function SimpleSim(props: { persective: PerspectiveKnowledgeGraph | undefined, population: number | undefined })
{
    // const power_demand_series = useMemo(() => uk_daily_power_demand_profiles["2010"].average_demand.data, [])

    const [power, set_power] = useState<PowerStats>({
        demand_gw: 0, //Math.round(power_demand_series[3]![2]! as number / 1e3),
        supply_gw: 0,
    })

    const [data, set_data] = useState<CellsData>(() => map_data_cells)

    useEffect(() =>
    {
        if (!props.persective || !props.population) return

        const { id, version } = props.persective.graph.apex_id
        const id_str = `${id}v${version}`
        const node = props.persective.graph.nodes[id_str]
        const computed_value = JSON.parse(node!.component.computed_value!)
        const kwh_per_day_per_person = computed_value.total_demand
        const demand_gw = convert_kwh_pd_pp_to_gw({ kwh_per_day_per_person, population: props.population })

        set_power(existing => ({
            ...existing,
            demand_gw,
        }))
    }, [props.persective?.graph, props.population])


    return <>
        <Canvas id="scene_3d">
            <InitialiseGeometriesEtc />
            <SimpleSim3d
                data={data}
                set_data={set_data}
                // power={power}
                set_power={set_power}
            />
        </Canvas>

        {false && <PowerStatus view="simulation" power={power} />}
        <WelcomeMessage2 />
        <WelcomeMessage1 />
        <Footer />
    </>
}
