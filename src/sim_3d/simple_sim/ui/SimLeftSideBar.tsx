import { EnergySupplyDemandActions } from "./EnergySupplyDemandActions"
import { EnergySupplyDemandGraph } from "./EnergySupplyDemandGraph"
import { GameDatetimeUI } from "./GameDatetimeUI"
import { GameScore } from "./GameScore"


interface SimLeftSideBarProps
{
}

export function SimLeftSideBar(_props: SimLeftSideBarProps)
{
    return <>
        <div className="app_controls_row justify_left" />
        <div className="app_controls_row justify_left" />
        <div className="app_controls_row justify_left">
            <GameScore />
        </div>

        <div className="app_controls_row justify_left">
            <EnergySupplyDemandGraph />
        </div>

        <div className="app_controls_row justify_left">
            <GameDatetimeUI />
        </div>

        <div className="app_controls_row justify_left">
            <EnergySupplyDemandActions />
        </div>

    </>
}
