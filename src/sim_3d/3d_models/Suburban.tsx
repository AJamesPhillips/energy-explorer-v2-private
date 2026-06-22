import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { COLOURS, CONSTANTS } from "../simple_sim/constants"
import { seeded_rand } from "../utils/seeded_random"


const { DEFAULT_SIZE_FOR_TILE_CONTENT: BASE_SIZE } = CONSTANTS

interface SuburbanTilesProps
{
    tiles: Array<{ x: number, y: number }>
    size?: number
    opacity?: number
}
export function SuburbanTiles({ tiles, size = BASE_SIZE, opacity = 1 }: SuburbanTilesProps)
{
    const suburban_mesh_ref = useRef<THREE.InstancedMesh>(null)

    // Place house instances on suburban tiles. Use layout effect so the
    // transforms are applied before paint, and compute bounding volumes for
    // correct frustum culling.
    useLayoutEffect(() =>
    {
        const mesh = suburban_mesh_ref.current
        if (!mesh) return

        const dummy = new THREE.Object3D()
        const tile_top_y = size * 0.03
        const half_h = size * 0.09  // half of 0.18 * size

        tiles.forEach(({ x, y }, index) =>
        {
            for (let i = 0; i < CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE; ++i)
            {
                const idx = index * CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE + i
                const stable_seed = x * 10000 + y
                const ox    = (seeded_rand(stable_seed, i * 3 + 200)     - 0.5) * size * 0.55
                const oz    = (seeded_rand(stable_seed, i * 3 + 201) - 0.5) * size * 0.55
                const scale = 0.75 + seeded_rand(stable_seed, i * 3 + 202) * 0.5  // 0.75 – 1.25

                dummy.position.set(
                    x + ox,
                    tile_top_y + half_h * scale,
                    y + oz,
                )
                dummy.scale.setScalar(scale)
                dummy.updateMatrix()
                mesh.setMatrixAt(idx, dummy.matrix)
            }
        })

        mesh.instanceMatrix.needsUpdate = true

        // compute_bounding_box(suburban_geo, tiles.length * CONSTANTS.BUILDINGS_PER_SUBURBAN_TILE, mesh)
    // We add opacity to the list of dependencies to cause the re-rendering of
    // the instanced mesh
    }, [tiles, tiles.length, size, opacity])


    const { suburban_geo, suburban_mat } = useMemo(() =>
    {
        const transparent = opacity < 1

        return {
            suburban_geo: new THREE.BoxGeometry(size * 0.32, size * 0.18, size * 0.32),
            suburban_mat: new THREE.MeshStandardMaterial({
                color: COLOURS.suburban,
                transparent,
                opacity,
                depthWrite: !transparent,
            }),
        }
    }, [size, opacity])

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
