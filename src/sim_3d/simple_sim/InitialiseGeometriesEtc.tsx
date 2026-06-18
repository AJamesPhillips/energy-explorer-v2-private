import { Text } from "@react-three/drei"
import { SolarFarmsInit } from "../3d_models/SolarFarm"
import { WindTurbineInit } from "../3d_models/WindTurbine"


export function InitialiseGeometriesEtc()
{
    return <>
        {/* Render an empty bit of Text otherwise when Drei Text is first rendered
            it causes the whole scene to unmount and remount for some reason. */}
        <Text>{""}</Text>
        <SolarFarmsInit />
        <WindTurbineInit />
    </>
}
