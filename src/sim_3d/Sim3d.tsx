import { PerspectiveKnowledgeGraph } from "../data/interface"
import { DigitalTwin } from "./digital_twin/DigitalTwin"
import { LimitedViewType } from "./interface"
import { SimpleSim } from "./simple_sim/SimpleSim"



export function Sim3d (props: { view: LimitedViewType, persective: PerspectiveKnowledgeGraph | undefined })
{
    return <>
        {props.view === "digital_twin" && <DigitalTwin />}
        {props.view === "simulation" && <SimpleSim
            persective={props.persective}
        />}
        {/* <GUI view={props.view} /> */}
    </>
}
