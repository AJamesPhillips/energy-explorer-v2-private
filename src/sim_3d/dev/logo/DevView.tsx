import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"

import { LightningBolt } from "../../3d_models/LightningBolt"
import { OilBarrel } from "../../3d_models/OilBarrel"


export function DevView ({ view }: { view: "dev_logo" })
{
    return <Canvas id="scene-3d">
        <DevLogo />
    </Canvas>
}


function DevLogo ()
{
    return <>
        <OrbitControls />
        <ambientLight intensity={1.5} />
        <directionalLight position={[8, 10, 5]} intensity={1} />

        <LightningBolt x={0} y={0} cell_size={20} />
        <OilBarrel x={0.5} y={0} cell_size={20} fuel_type="heating_fuel" />

    </>
}
