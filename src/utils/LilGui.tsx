import GUI from "lil-gui"
import { useEffect } from "react"


let display_lil_gui = window.location.hostname === "localhost"
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
