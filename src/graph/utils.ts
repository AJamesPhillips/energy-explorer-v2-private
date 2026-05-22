import { component_is_number } from "core/data/component_is"
import { DataComponent } from "core/data/interface"

import { DataComponentExtended } from "../data/interface"
import { NodeDifference } from "./interface"


/** Renders a DataComponent to a single-line display string. */
export function render_component(component: DataComponent): string
{
    return component.plain_title
}

/**
 * Returns the absolute and relative difference between the result_values of
 * two DataComponents.
 *   absolute_difference = component.result_value − alternative.result_value
 *   relative_difference = absolute_difference / |alternative.result_value|
 */
export function compute_differences(
    component: DataComponentExtended,
    alternative: DataComponentExtended | undefined,
): NodeDifference
{
    if (!component_is_number(component) && component.computed_value === undefined) return false

    if (!alternative) return undefined

    const val = get_numeric_result_value(component)
    const alt = get_numeric_result_value(alternative)
    const absolute_difference = val - alt
    const relative_difference = alt !== 0 ? absolute_difference / Math.abs(alt) : 0

    if (isNaN(absolute_difference) || isNaN(relative_difference)) return undefined

    return { absolute: absolute_difference, relative: relative_difference }
}

/**
 * Returns a CSS colour string for a given relative_difference value.
 *   • below minimum_relative_difference                → green
 *   • between minimum and maximum (exclusive)          → white → red (linear)
 *   • at or above maximum_relative_difference          → red
 */
export const LIKELY_AGGREEMENT_COLOUR = "#aee2b1"
export const AGGREEMENT_COLOUR = "#4caf50"
export function get_color_for_relative_difference(
    relative_difference: number,
    minimum_relative_difference: number,
    maximum_relative_difference: number,
): string
{
    const abs_rel_diff = Math.abs(relative_difference)
    if (abs_rel_diff < minimum_relative_difference) return AGGREEMENT_COLOUR
    if (abs_rel_diff >= maximum_relative_difference) return "#f44336"
    const t =
        (abs_rel_diff - minimum_relative_difference) /
        (maximum_relative_difference - minimum_relative_difference)
    const gb = Math.round(255 * (1 - t))
    return `rgb(255,${gb},${gb})`
}


export function get_numeric_result_value(component: DataComponentExtended): number
{
    let raw = component.computed_value

    if (raw)
    {
        const parsed = parseFloat(raw)
        if (!isNaN(parsed)) return parsed

        try
        {
            const parsed = JSON.parse(raw)
            if (typeof parsed === "number") return parsed

            // TODO: add a custom parser that can extract numeric values from
            // more complex data structures that component functions might return
            if (typeof parsed.value === "number") return parsed.value
            if (typeof parsed.net_value === "number") return parsed.net_value
        }
        catch
        {
            //
        }
    }

    raw = component.result_value
    // console.log("component.computed_value: ", component.computed_value)
    return parseFloat(raw ?? "0")
}


export function format_diff_text(absolute: number, relative: number, units: string | undefined)
{
    const sign = absolute >= 0 ? "+" : ""
    const line1 = `${sign}${absolute.toFixed(1)}` + (units ? ` ${units}` : "")
    const line2 = `(${sign}${(relative * 100).toFixed(0)}%)`
    return { line1, line2 }
}
