import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { CONSTANTS } from "../simple_sim/constants"
import { seeded_rand } from "../utils/seeded_random"


interface SuburbanTilesProps
{
    tiles: Array<{ x: number, y: number, id: number }>
    cell_size: number
}

export function SuburbanTiles({ tiles, cell_size }: SuburbanTilesProps)
{
    const suburban_mesh_ref = useRef<THREE.InstancedMesh>(null)

    // Place house instances on suburban tiles.
    useEffect(() =>
    {
        const mesh = suburban_mesh_ref.current
        if (!mesh) return

        const dummy = new THREE.Object3D()
        const tile_top_y = cell_size * 0.03
        const half_h = cell_size * 0.09  // half of 0.18 * cell_size

        tiles.forEach(({ x, y, id }, index) =>
        {
            for (let i = 0; i < CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE; ++i)
            {
                const idx = index * CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE + i
                const ox    = (seeded_rand(id, i * 3 + 200)     - 0.5) * cell_size * 0.55
                const oz    = (seeded_rand(id, i * 3 + 201) - 0.5) * cell_size * 0.55
                const scale = 0.75 + seeded_rand(id, i * 3 + 202) * 0.5  // 0.75 – 1.25

                dummy.position.set(
                    x * cell_size + ox,
                    tile_top_y + half_h * scale,
                    y * cell_size + oz,
                )
                dummy.scale.setScalar(scale)
                dummy.updateMatrix()
                mesh.setMatrixAt(idx, dummy.matrix)
            }
        })

        mesh.instanceMatrix.needsUpdate = true
    }, [tiles, cell_size])


    const { suburban_geo, suburban_mat } = useMemo(() =>
    {
        return {
            suburban_geo: new THREE.BoxGeometry(cell_size * 0.32, cell_size * 0.18, cell_size * 0.32),
            suburban_mat: new THREE.MeshStandardMaterial({ color: 0xAB5154 }),
        }
    }, [cell_size])

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
