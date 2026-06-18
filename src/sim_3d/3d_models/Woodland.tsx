import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { CONSTANTS } from "../simple_sim/constants"
import { seeded_rand } from "../utils/seeded_random"


interface WoodlandProps
{
    tiles: Array<{ x: number, y: number, id: number }>
    cell_size: number
}

export function Woodland({ tiles, cell_size }: WoodlandProps)
{
    const tree_mesh_ref = useRef<THREE.InstancedMesh>(null)

    // Place tree instances on woodland tiles.
    useEffect(() =>
    {
        const mesh = tree_mesh_ref.current
        if (!mesh) return

        const dummy = new THREE.Object3D()
        const tile_top_y = cell_size * 0.03  // half the tile height (0.06 * cell_size / 2)
        const cone_half_h = cell_size * 0.15 // half of cone height (0.3 * cell_size / 2)

        tiles.forEach(({ x, y, id }, index) =>
        {
            for (let i = 0; i < CONSTANTS.TREES_PER_TILE; ++i)
            {
                const idx = index * CONSTANTS.TREES_PER_TILE + i
                const ox    = (seeded_rand(id, i * 3)     - 0.5) * cell_size * 0.7
                const oz    = (seeded_rand(id, i * 3 + 1) - 0.5) * cell_size * 0.7
                const scale = 0.7 + seeded_rand(id, i * 3 + 2) * 0.6

                dummy.position.set(
                    x * cell_size + ox,
                    tile_top_y + cone_half_h * scale,
                    y * cell_size + oz,
                )
                dummy.scale.setScalar(scale)
                dummy.updateMatrix()
                mesh.setMatrixAt(idx, dummy.matrix)
            }
        })

        mesh.instanceMatrix.needsUpdate = true
    }, [tiles, cell_size])


    const { tree_geo, tree_mat } = useMemo(() =>
    {
        const h = cell_size * 0.3
        const r = cell_size * 0.12
        return {
            tree_geo: new THREE.ConeGeometry(r, h, 6),
            tree_mat: new THREE.MeshStandardMaterial({ color: 0x1a4a1a }),
        }
    }, [cell_size])

    useEffect(() => () =>
    {
        tree_geo.dispose()
        tree_mat.dispose()
    }, [tree_geo, tree_mat])


    if (tiles.length === 0) return null

    return <instancedMesh
        ref={tree_mesh_ref}
        args={[tree_geo, tree_mat, tiles.length * CONSTANTS.TREES_PER_TILE]}
    />
}
