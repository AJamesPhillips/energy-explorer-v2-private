import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { CONSTANTS } from "../simple_sim/constants"
import { seeded_rand } from "../utils/seeded_random"


interface UrbanTilesProps
{
    tiles: Array<{ x: number, y: number, id: number }>
    cell_size: number
}

export function UrbanTiles({ tiles, cell_size }: UrbanTilesProps)
{
    const urban_mesh_ref = useRef<THREE.InstancedMesh>(null)

    // Place office-block instances on urban tiles.
    useEffect(() =>
    {
        const mesh = urban_mesh_ref.current
        if (!mesh) return

        const dummy = new THREE.Object3D()
        const tile_top_y = cell_size * 0.03
        const half_h = cell_size * 0.225  // half of 0.45 * cell_size

        tiles.forEach(({ x, y, id }, index) =>
        {
            for (let i = 0; i < CONSTANTS.BUILDINGS_PER_URBAN_TILE; ++i)
            {
                const idx = index * CONSTANTS.BUILDINGS_PER_URBAN_TILE + i
                const ox    = (seeded_rand(id, i * 3 + 100)     - 0.5) * cell_size * 0.6
                const oz    = (seeded_rand(id, i * 3 + 101) - 0.5) * cell_size * 0.6
                const scale = 0.5 + seeded_rand(id, i * 3 + 102) * 1.0  // 0.5 – 1.5

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


    const { urban_geo, urban_mat } = useMemo(() =>
    {
        return {
            urban_geo: new THREE.BoxGeometry(cell_size * 0.22, cell_size * 0.45, cell_size * 0.22),
            urban_mat: new THREE.MeshStandardMaterial({ color: 0x8899aa }),
        }
    }, [cell_size])

    useEffect(() => () =>
    {
        urban_geo.dispose()
        urban_mat.dispose()
    }, [urban_geo, urban_mat])


    if (tiles.length === 0) return null

    return <instancedMesh
        ref={urban_mesh_ref}
        args={[urban_geo, urban_mat, tiles.length * CONSTANTS.BUILDINGS_PER_URBAN_TILE]}
    />
}
