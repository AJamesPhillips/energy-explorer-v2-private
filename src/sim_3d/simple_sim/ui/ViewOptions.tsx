
import { StackFrontIcon } from "../../../components/svgs"
import { get_app_state } from "../../../state/store"
import { CapacityFactorsSource, SetMapCapacityFactors } from "../../../state/view/interface"
import { is_narrow_screen } from "../../../utils/screen_type"
import { to_sentence_case } from "../../../utils/string"
import "./ui.css"


export function ViewOptions()
{
    const source = get_app_state(s => s.view.map_capacity_factors_source)
    const set_map_capacity_factors = get_app_state(s => s.view.set_map_capacity_factors)

    return <>
        <ButtonWithIcon
            source={source}
            set_map_capacity_factors={set_map_capacity_factors}
            specific_source="wind"
        />
        <ButtonWithIcon
            source={source}
            set_map_capacity_factors={set_map_capacity_factors}
            specific_source="solar"
        />
        <SourceAggregationButton />
    </>
}


interface ButtonWithIconProps
{
    source: CapacityFactorsSource | false
    set_map_capacity_factors: SetMapCapacityFactors
    specific_source: CapacityFactorsSource
}
function ButtonWithIcon(props: ButtonWithIconProps)
{
    const { specific_source } = props
    const is_active = props.source === specific_source

    return <div className="app_controls_row">
        <button
            className={"ui_button " + (is_active ? "active" : "")}
            style={{ padding: "6px 10px", zIndex: "var(--z-index-app-html-data_portal)" }}
            onClick={() =>
            {
                props.set_map_capacity_factors(is_active ? false : specific_source)
            }}
        >
            {to_sentence_case(specific_source)}<StackFrontIcon style={{ marginLeft: is_narrow_screen() ? 0 : 5 }} />
        </button>
    </div>
}


function SourceAggregationButton()
{
    const aggregation = get_app_state(s => s.view.map_capacity_factors_aggregation)
    const set_aggregation = get_app_state(s => s.view.set_map_capacity_factors)

    const new_aggregation = aggregation === "hourly" ? "annual_average" : "hourly"

    return <div className="app_controls_row">
        <button
            className={"ui_button"}
            style={{ padding: "6px 10px", zIndex: "var(--z-index-app-html-data_portal)" }}
            onClick={() =>
            {
                set_aggregation(
                    undefined,
                    new_aggregation,
                    new_aggregation === "annual_average",
                )
            }}
        >
            {to_sentence_case(aggregation)}
        </button>
    </div>
}
