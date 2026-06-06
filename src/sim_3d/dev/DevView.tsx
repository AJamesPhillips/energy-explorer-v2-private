import { Canvas } from "@react-three/fiber"

import { Dev3dModels } from "./Dev3dModels"
import { GeoDataStack } from "./GeoDataStack"


export const show_dev_view = true
export function DevView ()
{
    return <GeoDataStack />

    return <Canvas id="scene_3d">
        <Dev3dModels />
    </Canvas>
}
