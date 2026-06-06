import { Canvas } from "@react-three/fiber"
import * as THREE from "three"

import { useRef } from "react"
import { CONSTANTS, DEFAULTS } from "../simple_sim/constants"
import { IsoCamera } from "../simple_sim/IsoCamera"
import { Dev3dModels } from "./Dev3dModels"
import { H3Map } from "./dgg/H3Map"


const { GRID_SIZE } = CONSTANTS
const { sun_args } = DEFAULTS

export const show_dev_view = true
export function DevView ()
{
    const sun_ambient_ref = useRef<THREE.AmbientLight>(null)
    const sun_directional_ref = useRef<THREE.DirectionalLight>(null)

    return <Canvas id="scene_3d">
        <IsoCamera grid_size={GRID_SIZE} cell_size={20} />

        <ambientLight ref={sun_ambient_ref} />
        <directionalLight ref={sun_directional_ref} position={sun_args.direct_position} />

        <H3Map />
    </Canvas>

    return <Canvas id="scene_3d">
        <Dev3dModels />
    </Canvas>
}
