import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls as OrbitControlsImplementation } from "three/examples/jsm/Addons.js"

import uk_daily_power_demand_profiles from "../data/power_demand/uk/daily_profiles.json"
import { PowerStats } from "../model/old_interface"
import { CONSTANTS } from "../scene/CONSTANTS"
import { Earth } from "../scene/earth/Earth"
import { SpatialData } from "../scene/spatial_data/SpatialData"
import { PowerStatus } from "../simple_sim/PowerStatus"
import { clamp } from "../utils/clamp"
import { StarsV2 } from "./StarsV2"
import { Sun } from "./Sun"
import { WelcomeMessage } from "./WelcomeMessage"



const start_datetime = Date.UTC(2010, 0, 1, 0, 0, 0)
const end_datetime = Date.UTC(2010, 0, 2, 0, 0, 0)
function get_half_hour_index_from_datetime(datetime_ms: number): number
{
    const datetime = new Date(datetime_ms)
    const hours = datetime.getUTCHours()
    const minutes = datetime.getUTCMinutes()
    const half_hour_index = (hours * 2) + (minutes >= 30 ? 1 : 0)
    return half_hour_index
}


export const DigitalTwin = () =>
{
    const [datetime, set_datetime] = useState(start_datetime)
    const power_demand_series = useMemo(() => uk_daily_power_demand_profiles["2010"].average_demand.data, [])
    const [power, set_power] = useState<PowerStats>({
        demand_gw: 0,
        supply_gw: 0,
    })

    useEffect(() =>
    {
        // power_demand_series is an array with 3 + 48 elements in it
        const index = get_half_hour_index_from_datetime(datetime)
        const demand_w = power_demand_series[index + 1]![2]! as number
        set_power(prev => ({ ...prev, demand_gw: Math.round(demand_w / 1e3) }))

    }, [datetime])

    return <>
        <Canvas id="scene_3d">
            <UpdateDatetimeOnFrame set_datetime={set_datetime} />
            <DigitalTwinInner />
        </Canvas>

        <PowerStatus view="digital_twin" power={power} datetime={datetime} />
        <WelcomeMessage />
    </>
}


function UpdateDatetimeOnFrame({ set_datetime }: { set_datetime: React.Dispatch<React.SetStateAction<number>> })
{
    const simulation_time_speed = 1000 * 60 * 60 // 1 hour per second

    useFrame((_state, delta) =>
    {
        set_datetime(prev =>
        {
            let new_datetime = prev + (delta * simulation_time_speed)

            if (new_datetime > end_datetime) new_datetime = start_datetime

            return new_datetime
        })
    })

    return null
}


function DigitalTwinInner()
{
    const orbit_controls = useRef<OrbitControlsImplementation>(null)


    useThree(({ scene }) =>
    {
        scene.background = new THREE.Color(0x000011)
    })

    const [sun_direction, set_sun_direction] = useState(new THREE.Vector3())

    useFrame(() =>
    {
        const controls = orbit_controls.current
        if (controls)
        {
            // Slow down zooming when close to earth
            const distance = controls.getDistance()
            const distance_from_earth_surface = distance - CONSTANTS.earth.radius
            const zoom_speed = exponential_zoom_speed(distance_from_earth_surface)
            controls.zoomSpeed = zoom_speed

            // Dynamically change the pan (rotation) speed depending on camera's
            // distance from the Earth's surface
            const user_rotation_input_sensitivity = THREE.MathUtils.mapLinear(distance, controls.minDistance, 5, 0.01, 0.2)
            controls.rotateSpeed = user_rotation_input_sensitivity
        }
    })


    return <>
        <OrbitControls
            ref={orbit_controls as any}
            makeDefault
            enableDamping={true}
            rotateSpeed={1.0}
            // Update controls min/max distance based on sun distance and earth radius
            minDistance={CONSTANTS.controls.zoom.min}
            maxDistance={CONSTANTS.controls.zoom.max}
        />
        <PerspectiveCamera
            makeDefault
            // Show whole earth from far
            // position={[12, 5, 4]}
            // Show whole earth up close
            // position={[5, 0, 0]}
            // Focus on UK from far
            // position={[1.8, 2.65, 0]}
            // Focus on UK up close
            position={[1.420, 2.02, 0.045]}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[ 5, 5, 5 ]} intensity={0.5} />

        <StarsV2 />
        <Sun
            sun_direction={sun_direction}
            set_sun_direction={set_sun_direction}
        />
        <Earth sun_direction={sun_direction}>
            <SpatialData />
        </Earth>
        {/*
        load_and_render_model_data(common_dependencies, earth_mesh)
        load_and_render_countries(common_dependencies, earth_mesh)
        draw_earth_grid(common_dependencies, earth_mesh)
        get_run_display_model()
        */}
    </>
}


function exponential_zoom_speed(distance_from_earth_surface: number)
{
    const { zoom } = CONSTANTS.controls
    let speed = Math.pow(distance_from_earth_surface / 10, 0.7)
    speed = clamp(speed, zoom.min_speed, zoom.max_speed)
    return speed
}


// const user_choices: UserChoices = {
//     chosen_region: "UK",
//     wind_mw_power_plants: new DataMap([
//         [
//             new LatLonWithIsOnshore({ lat: 60.8333, lon: -0.7697, is_onshore: true }),
//             { name: "London Wind Farm", installed_mw_capacity: 10000 }
//         ],
//     ], LatLonWithIsOnshore.to_str, LatLonWithIsOnshore.from_str),
//     solar_mw_power_plants: new DataMap([], LatLonWithIsOnshore.to_str, LatLonWithIsOnshore.from_str),
//     storage_mw_power_plants: new DataMap([], LatLonWithIsOnshore.to_str, LatLonWithIsOnshore.from_str),
// }

// async function get_run_display_model()
// {
//     const model_data = await get_model_data()

//     const scenario: ModelScenario = {
//         datetime_range: new DatetimeRange({
//             start: new Date("2018-01-01T00:00:00Z"),
//             end: new Date("2019-01-01T00:00:00Z"),
//             repeat_every: "hour",
//         }),
//     }

//     const model_run_output = run_model(model_data, scenario, user_choices)

//     console.log("Model Run Output:", model_run_output)
//     const hours_lacking_power = model_run_output.hourly_net_supply_mw.filter(v => v < 0).length
//     const total_hours = model_run_output.model_datetime_steps.length
//     const time_without_sufficient_power_supply_percentage = (hours_lacking_power / total_hours) * 100
//     console.log(`% time without sufficient power supply: ${time_without_sufficient_power_supply_percentage.toFixed(2)}% (${hours_lacking_power} hours out of ${total_hours} total hours)`)
//     console.log(`Total generated TWh: ${(model_run_output.hourly_total_generation_mw.reduce((sum, v) => sum + v, 0)/1e6).toFixed(2)} TWh`)
//     console.log(`Net supplied TWh: ${(model_run_output.hourly_net_supply_mw.reduce((sum, v) => sum + v, 0)/1e6).toFixed(2)} TWh`)
// }


// function add_power_plant()
// {
//     user_choices.solar_mw_power_plants.set(
//         new LatLonWithIsOnshore({ lat: 50.9096, lon: 0.0000, is_onshore: true }),
//         { name: "London Solar Farm", installed_mw_capacity: 5000 }
//     )
// }
// ;(window as any).add_power_plant = add_power_plant
// ;(window as any).get_run_display_model = get_run_display_model
