import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { CONSTANTS } from "../simple_sim/constants"
import { seeded_rand } from "../utils/seeded_random"


const { DEFAULT_SIZE_FOR_TILE_CONTENT: BASE_SIZE } = CONSTANTS

interface SuburbanTilesProps
{
    tiles: Array<{ x: number, y: number, id: number }>
    size?: number
}
export function SuburbanTiles({ tiles, size = BASE_SIZE }: SuburbanTilesProps)
{
    const suburban_mesh_ref = useRef<THREE.InstancedMesh>(null)

    // Place house instances on suburban tiles.
    useEffect(() =>
    {
        const mesh = suburban_mesh_ref.current
        if (!mesh) return

        const dummy = new THREE.Object3D()
        const tile_top_y = size * 0.03
        const half_h = size * 0.09  // half of 0.18 * size

        tiles.forEach(({ x, y, id }, index) =>
        {
            for (let i = 0; i < CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE; ++i)
            {
                const idx = index * CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE + i
                const ox    = (seeded_rand(id, i * 3 + 200)     - 0.5) * size * 0.55
                const oz    = (seeded_rand(id, i * 3 + 201) - 0.5) * size * 0.55
                const scale = 0.75 + seeded_rand(id, i * 3 + 202) * 0.5  // 0.75 – 1.25

                dummy.position.set(
                    x * size + ox,
                    tile_top_y + half_h * scale,
                    y * size + oz,
                )
                dummy.scale.setScalar(scale)
                dummy.updateMatrix()
                mesh.setMatrixAt(idx, dummy.matrix)
            }
        })

        mesh.instanceMatrix.needsUpdate = true
    }, [tiles, size])


    const { suburban_geo, suburban_mat } = useMemo(() =>
    {
        return {
            suburban_geo: new THREE.BoxGeometry(size * 0.32, size * 0.18, size * 0.32),
            suburban_mat: new THREE.MeshStandardMaterial({ color: 0xAB5154 }),
        }
    }, [size])

    useEffect(() => () =>
    {
        suburban_geo.dispose()
        suburban_mat.dispose()
    }, [suburban_geo, suburban_mat])


    if (tiles.length === 0) return null

    return <instancedMesh
        ref={suburban_mesh_ref}
        args={[suburban_geo, suburban_mat, tiles.length * CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE]}
    />
}
