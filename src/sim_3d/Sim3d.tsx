import { PerspectiveKnowledgeGraph } from "../data/interface"
import { DigitalTwin } from "./digital_twin/DigitalTwin"
import { LimitedViewType } from "./interface"
import { SimpleSim } from "./simple_sim/SimpleSim"



export const Sim3d = (props: { view: LimitedViewType, persective: PerspectiveKnowledgeGraph | undefined, population: number | undefined }) =>
{
    return <>
        {props.view === "digital_twin" && <DigitalTwin />}
        {props.view === "simulation" && <SimpleSim
            persective={props.persective}
            population={props.population}
        />}
        {/* <GUI view={props.view} /> */}
    </>
}
