import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { CONSTANTS } from "../simple_sim/constants"
import { seeded_rand } from "../utils/seeded_random"


const { DEFAULT_SIZE_FOR_TILE_CONTENT: BASE_SIZE } = CONSTANTS

interface WoodlandProps
{
    tiles: Array<{ x: number, y: number }>
    size?: number
}
export function Woodland({ tiles, size = BASE_SIZE }: WoodlandProps)
{
    const tree_mesh_ref = useRef<THREE.InstancedMesh>(null)

    console.log(tiles)

    // Place tree instances on woodland tiles. Use `useLayoutEffect` so the
    // matrices are populated before paint; then compute bounding volumes so
    // Three's frustum culling has correct bounds for the instanced mesh.
    useLayoutEffect(() =>
    {
        const mesh = tree_mesh_ref.current
        if (!mesh) return

        const dummy = new THREE.Object3D()
        const tile_top_y = size * 0.03  // half the tile height (0.06 * size / 2)
        const cone_half_h = size * 0.15 // half of cone height (0.3 * size / 2)

        tiles.forEach(({ x, y }, index) =>
        {
            for (let i = 0; i < CONSTANTS.TREES_PER_TILE; ++i)
            {
                const idx = index * CONSTANTS.TREES_PER_TILE + i
                const stable_seed = x * 10000 + y
                const ox    = (seeded_rand(stable_seed, i * 3)     - 0.5) * size * 0.7
                const oz    = (seeded_rand(stable_seed, i * 3 + 1) - 0.5) * size * 0.7
                const scale = 0.7 + seeded_rand(stable_seed, i * 3 + 2) * 0.6

                dummy.position.set(
                    x + ox,
                    tile_top_y + cone_half_h * scale,
                    y + oz,
                )
                dummy.scale.setScalar(scale)
                dummy.updateMatrix()
                mesh.setMatrixAt(idx, dummy.matrix)
            }
        })

        mesh.instanceMatrix.needsUpdate = true

        // compute_bounding_box(tree_geo, tiles.length * CONSTANTS.TREES_PER_TILE, mesh)
    }, [tiles, tiles.length, size])


    const { tree_geo, tree_mat } = useMemo(() =>
    {
        const h = size * 0.3
        const r = size * 0.12
        return {
            tree_geo: new THREE.ConeGeometry(r, h, 6),
            tree_mat: new THREE.MeshStandardMaterial({ color: 0x1a4a1a }),
        }
    }, [size])

    useEffect(() => () =>
    {
        tree_geo.dispose()
        tree_mat.dispose()
    }, [tree_geo, tree_mat])


    if (tiles.length === 0) return null

    return <instancedMesh
        frustumCulled={false}
        ref={tree_mesh_ref}
        args={[tree_geo, tree_mat, tiles.length * CONSTANTS.TREES_PER_TILE]}
    />
}
