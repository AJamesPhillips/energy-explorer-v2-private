import GUI from "lil-gui"
import { useEffect } from "react"
import { is_on_localhost } from "./is_on_localhost"


let display_lil_gui = is_on_localhost()
display_lil_gui = false
export const lil_gui = new GUI({ width: 300 })

export function LilGui()
{
    useEffect(() =>
    {
        if (!display_lil_gui)
        {
            lil_gui.hide()
            return
        }

        lil_gui.show()
        lil_gui.domElement.style.position = "absolute"
        lil_gui.domElement.style.top = "10px"
        lil_gui.domElement.style.right = "10px"
        lil_gui.domElement.style.zIndex = "1000"
        document.body.appendChild(lil_gui.domElement)

        return () =>
        {
            lil_gui.destroy()
        }
    }, [])

    return null
}
