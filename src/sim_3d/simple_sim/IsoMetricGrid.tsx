import { Instance, Instances } from "@react-three/drei"
import { ThreeEvent } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { tile_colour } from "./constants"
import { CellDataV1, CellsData } from "./interface"
import { InvalidPlacementAnimations } from "./InvalidPlacementAnimation"
import { IsoMetricGridContentTiles } from "./IsoMetricGridContentTiles"
import { bevel_colours, box_geometry_for_cell_size } from "./IsoMetricTileConstants"
import { TilePowerChangeAnimations } from "./tile_power/TilePowerChangeAnimation"


interface IsoMetricGridProps
{
    size: { x: number, y: number }
    cell_size: number
    data: CellsData
    on_click_tile?: (tile: CellDataV1) => void
    /** Fired with null when the pointer leaves the grid entirely. */
    on_hover_tile?: (tile: CellDataV1 | null) => void
}
export function IsoMetricGrid(props: IsoMetricGridProps)
{
    const { size, cell_size, data, on_click_tile, on_hover_tile } = props

    const hover_ref = useRef<THREE.Group>(null)
    const [hover_visible, set_hover_visible] = useState(false)


    const tiles = useMemo<CellDataV1[]>(() =>
    {
        const result: CellDataV1[] = []
        for (let y = 0; y < size.y; y++)
        {
            for (let x = 0; x < size.x; x++)
            {
                const cell = data[x]?.[y]
                if (cell) result.push(cell)
            }
        }
        return result
    }, [data, size.x, size.y])

    const { box_geo_s, box_geo_h } = box_geometry_for_cell_size(cell_size)
    const hover_geo_s = box_geo_s * 1.01
    const hover_geo_h = box_geo_h * 1.01


    const { hover_outline_geo, hover_glow_geo, hover_outline_mat, hover_glow_mat } = useMemo(() =>
    {
        const box_for_glow = new THREE.BoxGeometry(hover_geo_s, hover_geo_h, hover_geo_s)
        const box_for_outline = new THREE.BoxGeometry(hover_geo_s * 1.01, hover_geo_h * 1.01, hover_geo_s * 1.01)
        const edges = new THREE.EdgesGeometry(box_for_outline)
        box_for_outline.dispose()
        return {
            hover_outline_geo: edges,
            hover_glow_geo: box_for_glow,
            hover_outline_mat: new THREE.LineBasicMaterial({ color: 0xffff44 }),
            hover_glow_mat: new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.12 }),
        }
    }, [cell_size])

    useEffect(() => () =>
    {
        hover_outline_geo.dispose()
        hover_glow_geo.dispose()
        hover_outline_mat.dispose()
        hover_glow_mat.dispose()
    }, [hover_outline_geo, hover_glow_geo, hover_outline_mat, hover_glow_mat])


    const on_click = useCallback((e: ThreeEvent<MouseEvent>) =>
    {
        e.stopPropagation()
        if (e.instanceId === undefined) return
        const tile = tiles[e.instanceId]
        if (tile) on_click_tile?.(tile)
    }, [tiles, on_click_tile])

    const on_pointer_move = useCallback((e: ThreeEvent<PointerEvent>) =>
    {
        if (e.instanceId === undefined) return
        const tile = tiles[e.instanceId]
        if (!tile) return
        if (hover_ref.current)
        {
            hover_ref.current.position.set(tile.x * cell_size, 0, tile.y * cell_size)
        }
        set_hover_visible(true)
        on_hover_tile?.(tile)
    }, [tiles, on_hover_tile, cell_size])

    const on_pointer_leave = useCallback(() =>
    {
        set_hover_visible(false)
        on_hover_tile?.(null)
    }, [on_hover_tile])


    // This is a hack to help minimise the chance of this race condition occuring
    // https://github.com/pmndrs/react-three-fiber/issues/3736
    const [rendered_once, set_rendered_once] = useState(false)
    useEffect(() => set_rendered_once(true))

    return <>
        <Instances limit={tiles.length}>
            <boxGeometry args={[box_geo_s, box_geo_h, box_geo_s]}>
                <bufferAttribute attach="attributes-color" args={[bevel_colours, 3]} />
            </boxGeometry>
            <meshStandardMaterial vertexColors={true} />
            {tiles.map((cell) =>
            {
                const { x, y } = cell

                return <Instance
                    key={`${x}-${y}`}
                    position={[x * cell_size, 0, y * cell_size]}
                    color={tile_colour(cell.subtype)}
                    onClick={on_click_tile ? on_click : undefined}
                    onPointerMove={on_pointer_move}
                    onPointerLeave={on_pointer_leave}
                />
            })}
        </Instances>

        {rendered_once && <IsoMetricGridContentTiles cell_size={cell_size} tiles={tiles} />}
        {rendered_once && <TilePowerChangeAnimations cell_size={cell_size} />}
        {rendered_once && <InvalidPlacementAnimations cell_size={cell_size} />}

        <group ref={hover_ref} visible={hover_visible}>
            <lineSegments args={[hover_outline_geo, hover_outline_mat]} />
            <mesh args={[hover_glow_geo, hover_glow_mat]} />
        </group>
    </>
}
