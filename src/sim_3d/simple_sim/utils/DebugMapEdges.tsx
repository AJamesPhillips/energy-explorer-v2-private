import { useFrame } from "@react-three/fiber"
import { RefObject, useMemo, useState } from "react"
import * as THREE from "three"


interface DebugMapEdgesProps
{
    visible: boolean
    controls_ref: RefObject<{ object: THREE.Camera } | null>
    PAN_MIN_X: (zoom: number) => number
    PAN_MAX_X: (zoom: number) => number
    PAN_MIN_Z: (zoom: number) => number
    PAN_MAX_Z: (zoom: number) => number
}

export function DebugMapEdges(props: DebugMapEdgesProps)
{
    const { controls_ref, PAN_MIN_X, PAN_MAX_X, PAN_MIN_Z, PAN_MAX_Z } = props

    const [zoom, set_zoom] = useState((controls_ref.current?.object as any)?.zoom ?? 1)

    if (!props.visible) return null

    useFrame(() =>
    {
        if (!controls_ref.current) return
        const new_zoom = (controls_ref.current?.object as any)?.zoom
        if (new_zoom !== zoom) set_zoom(new_zoom)
    })

    return <>
        {/* Pan boundary — orange */}
        <Rect
            x1={PAN_MIN_X(zoom)}
            z1={PAN_MIN_Z(zoom)}
            x2={PAN_MAX_X(zoom)}
            z2={PAN_MAX_Z(zoom)}
            color="#ff8800"

        />
    </>
}

/** Flat rectangle outline drawn in the XZ plane at a given Y height. */
function Rect(props: { x1: number; z1: number; x2: number; z2: number; y?: number; color: string })
{
    const { x1, z1, x2, z2, y = 1, color } = props

    const positions = useMemo(
        () => new Float32Array([x1, y, z1, x2, y, z1, x2, y, z2, x1, y, z2]),
        [x1, z1, x2, z2, y],
    )

    return (
        <lineLoop>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={4} />
        </lineLoop>
    )
}
