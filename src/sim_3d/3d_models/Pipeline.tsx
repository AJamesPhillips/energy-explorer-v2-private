import { XY } from "../dev/projection"
import { COLOURS } from "../simple_sim/constants"


const BASE_SIZE = 5
const PIPE_SIZE = BASE_SIZE / 10

export interface PipelineProps
{
    start: XY
    end: XY
    type: "electric" | "gas" | "oil"
}

export function Pipeline(props: PipelineProps)
{
    const position: [number, number, number] = [(props.start.x + props.end.x) / 2, PIPE_SIZE, (props.start.y + props.end.y) / 2]
    const rotation_y = Math.atan2(props.end.y - props.start.y, props.end.x - props.start.x)

    return <>
        <mesh
            position={position}
            rotation={[Math.PI/2, 0, rotation_y - Math.PI/2]}
        >
            <cylinderGeometry args={[PIPE_SIZE, PIPE_SIZE, Math.sqrt((props.end.x - props.start.x) ** 2 + (props.end.y - props.start.y) ** 2), 32]} />
            <meshStandardMaterial color={COLOURS.pipeline[props.type]} />
        </mesh>
    </>
}
