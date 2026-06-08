import { Text } from "@react-three/drei"

import { CONSTANTS } from "./constants"
import { SolarFarmsInit } from "./tiles/SolarFarm"


const { CELL_SIZE } = CONSTANTS

export function InitialiseGeometriesEtc({ cell_size = CELL_SIZE }: { cell_size?: number })
{
    return <>
        {/* Render an empty bit of Text otherwise when Drei Text is first rendered
            it causes the whole scene to unmount and remount for some reason. */}
        <Text>{""}</Text>
        <SolarFarmsInit cell_size={cell_size} />
    </>
}
