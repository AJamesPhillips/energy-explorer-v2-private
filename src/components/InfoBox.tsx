import { JSX, useCallback, useEffect, useState } from "react"

import "./InfoBox.css"

// const HIDE_ALL_IN_DEV = true
const HIDE_ALL_IN_DEV = false


interface InfoBoxProps
{
    message: string | JSX.Element | ((p: { close_info_box: (() => void) }) => JSX.Element)
    on_close: () => void
    confirmation_button?: ((p: { close_info_box: (() => void) }) => JSX.Element)
    wider_info_box?: boolean
}
export function InfoBox(props: InfoBoxProps)
{
    const [hiding, set_hiding] = useState(false)
    const [show_nothing, set_show_nothing] = useState(HIDE_ALL_IN_DEV || false)

    const close_info_box = useCallback(() =>
    {
        set_hiding(true)
    }, [])

    useEffect(() =>
    {
        if (hiding)
        {
            const timeout = setTimeout(() =>
            {
                set_show_nothing(true)
                props.on_close()
            }, 300) // match with the CSS transition duration

            return () => clearTimeout(timeout)
        }
    }, [hiding])


    if (show_nothing) return null


    const confirmation_button = props.confirmation_button
        ? props.confirmation_button({ close_info_box })
        : <DefaultConfirmationButton close_info_box={close_info_box}/>


    return <div id="info_box" className={(hiding ? "hidden" : "")}>
        <div id="info_box_text_holder" onClick={e =>
        {
            // Make sure we do not propagate any click events to elements in the
            // darkened background behind the info box.
            e.stopPropagation()

            // Close the info box
            close_info_box()
        }}>
            <div
                id="info_box_text"
                className={props.wider_info_box ? "wider_info_box" : ""}
                onClick={e => e.stopPropagation()}
            >
                {message_as_jsx(props.message, close_info_box)}

                {confirmation_button}
            </div>
        </div>
    </div>
}


function message_as_jsx(message: string | JSX.Element | ((p: { close_info_box: (() => void) }) => JSX.Element), close_info_box: () => void)
{
    if (typeof message === "string") return <p>{message}</p>
    if (typeof message === "function") return message({ close_info_box })
    return message
}


function DefaultConfirmationButton(props: { close_info_box: () => void })
{
    return <button onClick={props.close_info_box}>
        Got it!
    </button>
}


interface OnceOffInfoBoxProps
{
    id: string
    message: string | JSX.Element | ((p: { close_info_box: (() => void) }) => JSX.Element)
    on_close?: () => void
    confirmation_button_text?: string
    confirmation_button?: ((p: { close_info_box: (() => void) }) => JSX.Element)
    hide_offer_to_not_show_again?: boolean
}
export function OnceOffInfoBox(props: OnceOffInfoBoxProps)
{
    const local_storage_info_box_shown = boolean_local_storage(props.id)

    if (local_storage_info_box_shown) return null


    function confirmation_button_fn(p: { close_info_box: () => void })
    {
        return <>
            <button onClick={p.close_info_box}>
                {props.confirmation_button_text ?? "Got it!"}
            </button>

            {!props.hide_offer_to_not_show_again && <>
                <input
                    type="checkbox"
                    id="info_box_checkbox"
                    onChange={() =>
                    {
                        p.close_info_box()
                        localStorage.setItem(props.id, new Date().toISOString())
                    }}
                />
                <label htmlFor="info_box_checkbox">Don't show this again</label>
            </>}
        </>
    }


    return <InfoBox
        message={props.message}
        on_close={() => {}}
        confirmation_button={confirmation_button_fn}
    />
}


function boolean_local_storage(key_name: string, time_to_live_ms = 1000 * 60 * 60 * 24 * 365)
{
    const value = localStorage.getItem(key_name)
    // return false
    if (!value) return false

    const date = Date.parse(value)
    if (isNaN(date)) return false

    if ((date + time_to_live_ms) < Date.now())
    {
        // localStorage.removeItem(key_name)
        return false
    }

    return true
}
