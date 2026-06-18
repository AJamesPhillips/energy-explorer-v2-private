import { EnergySupplyDemandActions } from "./EnergySupplyDemandActions"
import { GameDatetimeUI } from "./GameDatetimeUI"


interface SimLeftSideBarProps
{
}

export function SimLeftSideBar(_props: SimLeftSideBarProps)
{
    return <>
        <div className="app_controls_row justify_left">
            <GameDatetimeUI />
        </div>

        <div className="app_controls_row justify_left">
            <EnergySupplyDemandActions />
        </div>

    </>
}
