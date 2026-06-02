import { SingleOilRig } from "../../3d_models/SingleOilRig"
import { CellData } from "../interface"


interface OilRigTilesProps
{
    tiles: Array<Pick<CellData, "x" | "y" | "has_oil_rig">>
    cell_size: number
}

export function OilRigTiles({ tiles, cell_size }: OilRigTilesProps)
{
    if (tiles.length === 0) return null

    return <>
        {tiles.map(({ x, y, has_oil_rig }) => {
            const state = has_oil_rig?.state ?? "dormant"
            const built_progress = has_oil_rig?.built_progress ?? 0

            return <group key={`${x}-${y}`}>
                <SingleOilRig
                    x={x} y={y} cell_size={cell_size}
                    state={state}
                    built_progress={built_progress}
                />
            </group>
        })}
    </>
}
