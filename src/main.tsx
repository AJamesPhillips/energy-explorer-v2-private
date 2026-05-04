import { setup_error_logging } from "./error_logging"
setup_error_logging()

import { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import * as z from "zod"

import "./monkey_patch"

import { flatten_new_or_data_component_to_json, hydrate_data_component_from_json } from "core/data/convert_between_json"
import { data_components_by_ido, data_components_by_idv } from "core/data/utils/data_components_by_id"
import { make_graph } from "core/data/utils/graph"
import { make_field_validators } from "core/data/validate_fields"
import { Evaluator } from "core/evaluator/implementation/browser_react_Evaluator"
import { DataComponentAsJSON } from "core/supabase"

import { BalanceSheet } from "./balance_sheet/BalanceSheet"
import { factors_up_to } from "./balance_sheet/EnergyBoxesHelper"
import { Options, ViewType } from "./components/Options"
import { SelectCountry } from "./components/SelectCountry"
import {
    perspective_id_general,
    PerspectiveType,
    SelectPerspective
} from "./components/SelectPerspective"
import { get_wikisim_components } from "./data/get_wikisim_components"
import { all_ids_to_fetch } from "./data/ids"
import { DataComponentExtended, PerspectiveKnowledgeGraph } from "./data/interface"
import { GraphViewer } from "./graph/GraphViewer"
import "./main.css"
import { Sim3d } from "./sim_3d/Sim3d"
import { DataPortal } from "./sim_3d/simple_sim/ui/DataPortal"
import { GraphPopulation } from "./sim_3d/simple_sim/ui/GraphPopulation"
import { Info } from "./sim_3d/simple_sim/ui/Info"


function App ()
{
    // const [view, set_view] = useState<ViewType>("balance_sheet")
    // const [view, set_view] = useState<ViewType>("digital_twin")
    const [view, set_view] = useState<ViewType>("simulation")
    const [selected_perspectives, set_selected_perspectives] = useState<PerspectiveType[]>([
        perspective_id_general,
        // perspective_id_2009_mackay,
    ])


    function log_error(error: string)
    {
        console.error(error)
    }


    const [components, set_components] = useState(cached_components({ bust_cache: false }))

    useEffect(() =>
    {
        if (components)
        {
            console.log(`Using cache of ${components.length} components`)
            return
        }

        get_wikisim_components(all_ids_to_fetch, (components) =>
        {
            set_components(components)
            cache_components(components)
        })
    }, [])
    const components_map_by_idv = useMemo(() => data_components_by_idv(components), [components])
    const components_map_by_ido = useMemo(() => data_components_by_ido(components), [components])


    const population_by_year = useMemo<undefined | Record<number, number>>(() =>
    {
        const population_id = "1011v12" // UK population
        const population_component = components_map_by_idv[population_id]
        if (!population_component) return undefined

        const data = JSON.parse(population_component.computed_value!)
        return Object.fromEntries(data)
    }, [components_map_by_idv])

    const [year, set_year] = useState(2026)
    const [population, set_population] = useState<number | undefined>(undefined)


    // Make the knowledge graph
    const parser = useMemo(() => new DOMParser(), [])

    const persectives: PerspectiveKnowledgeGraph[] = useMemo(() =>
    {
        if (Object.keys(components_map_by_idv).length === 0) return []

        const idv_of_concepts = components_map_by_ido[perspective_id_general]?.id
        if (!idv_of_concepts)
        {
            log_error(`Concept id ${perspective_id_general} not found in components_map_by_ido`)
            return []
        }

        const perspective_id1 = selected_perspectives[1]!
        const idv_of_comparison = components_map_by_ido[perspective_id1]?.id

        return selected_perspectives.map(perspective_id =>
        {
            const idv_of_interest = components_map_by_ido[perspective_id]?.id
            if (!idv_of_interest)
            {
                log_error(`Perspective id ${idv_of_interest} not found in components_map_by_ido`)
                return null
            }

            const graph = make_graph(parser, components_map_by_idv, {
                idv_of_concepts,
                idv_of_interest,
                idv_of_comparison,
            })

            const factors = factors_up_to("Defence", graph)

            const sinks = factors.filter(f => f.type === "sink").reverse()
            const sources = factors.filter(f => f.type !== "sink").reverse()

            return {
                id: perspective_id,
                graph,
                sinks,
                sources,
            }
        })
        .filter(p => !!p)
    }, [components_map_by_idv, selected_perspectives.join(",")])


    const sim_or_dt = (view === "simulation" || view === "digital_twin")


    return <>
        <Evaluator />

        {sim_or_dt && <Sim3d view={view} persective={persectives[0]} population={population} />}

        <div id="app_html">

            {!!(new URLSearchParams(document.location.search).has("other_mediums")) &&
                <Options selected={view} on_select={set_view} />
            }

            <div style={{ display: "flex", gap: "20px", flexDirection: "column", flexGrow: 1 }}>
                <div id="app_top_bar">
                    <div id="app_top_bar_side">
                        <div className="app_controls_row">
                            <SelectCountry selected_country_ISO2="GB" />
                        </div>
                        <div className="app_controls_row">
                            <Info />
                        </div>
                        <div className="app_controls_row">
                            <DataPortal />
                        </div>
                        {!sim_or_dt && <SelectPerspective
                            force_single={sim_or_dt}
                            selected_perspectives={selected_perspectives}
                            on_change={set_selected_perspectives}
                        />}
                        {sim_or_dt && population_by_year && <GraphPopulation
                            population_by_year={population_by_year}
                            year={year}
                            set_year={set_year}
                            population={population}
                            set_population={set_population}
                        />}
                    </div>
                </div>

                <div id="app_main_view">
                    {view === "balance_sheet" && <BalanceSheet
                        persectives={persectives}
                        components_map_by_idv={components_map_by_idv}
                        components_map_by_ido={components_map_by_ido}
                    />}
                    {view === "knowledge_graph" && <GraphViewer persectives={persectives} />}
                </div>
            </div>

        </div>
    </>
}

const root = createRoot(document.getElementById("app")!)
root.render(<App />)

interface DataComponentAsJSONForGraph extends DataComponentAsJSON
{
    computed_value: string | undefined
    multiple_versions: { latest_version: number } | undefined
}

function cached_components(args: { bust_cache?: boolean } = {}): DataComponentExtended[] | undefined
{
    const cached = localStorage.getItem(get_cache_name())
    if (!cached || args.bust_cache) return undefined

    try
    {
        const parsed = JSON.parse(cached) as DataComponentAsJSONForGraph[]
        const validators = make_field_validators(z)
        if (Array.isArray(parsed)) return parsed.map(j =>
        {
            const { computed_value, multiple_versions, ...rest } = j
            const hydrated: DataComponentExtended = {
                ...hydrate_data_component_from_json(rest, validators),
                computed_value,
                multiple_versions,
            }
            return hydrated
        })
        return undefined
    }
    catch (e)
    {
        console.error("Error parsing cached components", e)
        return undefined
    }
}


function cache_components(components: DataComponentExtended[])
{
    try
    {
        const json = components.map(c =>
        {
            const { computed_value, multiple_versions, ...rest } = c
            const json: DataComponentAsJSONForGraph = {
                ...flatten_new_or_data_component_to_json(rest),
                computed_value,
                multiple_versions,
            }
            return json
        })
        localStorage.setItem(get_cache_name(), JSON.stringify(json))
    }
    catch (e)
    {
        console.error("Error caching components", e)
    }
}


function get_cache_name()
{
    return "components_" + document.location.pathname.replace(/\//g, "_")
}
