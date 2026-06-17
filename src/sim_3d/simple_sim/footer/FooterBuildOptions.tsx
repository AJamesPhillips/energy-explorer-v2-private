import { ReactNode } from "react"

import { BulldozerIcon, CloseIcon } from "../../../components/svgs"
import { BuildingActionTypeString } from "../../../state/building_action/interface"
import { get_app_state } from "../../../state/store"
import "./FooterBuildOptions.css"


export interface ActionOption
{
    text: string
    enabled: boolean
    type: BuildingActionTypeString
}

export function FooterBuildOptions(props: {
    options: ActionOption[]
    build_aria_label: (option: string) => string
    toggle_aria_label: string
    toggle_collapsed_content: ReactNode
    remove_aria_label: string
})
{
    const building_action = get_app_state(state => state.building_action)
    const active = building_action.active
    const selected_option = active ? active.type : false
    const show_options = props.options.some(option => option.type === selected_option)

    const handle_option_click = (action_type: BuildingActionTypeString | false) =>
    {
        building_action.set_building_action(action_type ? { type: action_type } : false)
    }

    return <div className="footer_row">
        <div className="actions_stack">
            {show_options && <div className="actions_options">
                {props.options.map(option => <button
                    key={option.text}
                    type="button"
                    className={
                        "ui_button "
                        + (selected_option === option.type ? "actions_option_selected" : "")
                        + (option.enabled ? "" : "actions_option_disabled")
                    }
                    onClick={() => handle_option_click(option.type)}
                    aria-label={props.build_aria_label(option.text)}
                    disabled={!option.enabled}
                >
                    {option.text}
                </button>)}
                {false && <button
                    type="button"
                    className={"ui_button actions_bulldozer_button " + (selected_option === "bulldozer" ? "actions_option_selected" : "")}
                    onClick={() => handle_option_click("bulldozer")}
                    aria-label={props.remove_aria_label}
                >
                    <BulldozerIcon style={{ height: 30 }} />
                </button>}
            </div>}

            <button
                type="button"
                className="ui_button actions_toggle_button"
                onClick={() => handle_option_click(show_options ? false : props.options[0]!.type)}
                aria-expanded={show_options}
                aria-label={props.toggle_aria_label}
            >
                {show_options
                    ? <CloseIcon style={{ height: 16 }} />
                    : props.toggle_collapsed_content}
            </button>
        </div>
    </div>
}
