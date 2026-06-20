import { OrbitControls, PerspectiveCamera } from "@react-three/drei"

import { deg_to_rad } from "../../utils/angle"
import { BatteryStorage } from "../3d_models/BatteryStorage"
import { CCGTPlant } from "../3d_models/CCGTPlant"
import { LightningBolt } from "../3d_models/LightningBolt"
import { NuclearPlant } from "../3d_models/NuclearPlant"
import { OilBarrel } from "../3d_models/OilBarrel"
import { PowerLine, PowerPylon, PowerPylonProps } from "../3d_models/PowerPylon"


export function Dev3dModels ()
{
    const pylon_1: PowerPylonProps = { x: 1, y: 0, rotation: deg_to_rad(90), capacity: 4 }
    const pylon_2: PowerPylonProps = { x: -0.5, y: 0, rotation: deg_to_rad(90), capacity: 2 }

    return <>
        <OrbitControls />
        <PerspectiveCamera
            makeDefault
            position={[30, 30, 30]}
        />
        <ambientLight intensity={1.5} />
        <directionalLight position={[8, 10, 5]} intensity={1} />

        <LightningBolt x={1.5} y={-2} size={20} />
        <OilBarrel x={0.5} y={-2} cell_size={20} fuel_type="heating_fuel" />
        <NuclearPlant x={-1.5} y={-2} cell_size={20} />
        <CCGTPlant x={0} y={-1} cell_size={20} />
        <BatteryStorage x={-0.5} y={-2} cell_size={20} />

        <PowerPylon {...pylon_1} />
        <PowerPylon {...pylon_2} />
        <PowerLine pylon_a={pylon_1}
                   pylon_b={pylon_2} />
    </>
}
