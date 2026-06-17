import GUI from "lil-gui"
import { useEffect } from "react"


let display_lil_gui = window.location.hostname === "localhost"
display_lil_gui = false
export const gui = new GUI({ width: 300 })

export function LilGui()
{
    useEffect(() =>
    {
        if (!display_lil_gui)
        {
            gui.hide()
            return
        }

        gui.show()
        gui.domElement.style.position = "absolute"
        gui.domElement.style.top = "10px"
        gui.domElement.style.right = "10px"
        gui.domElement.style.zIndex = "1000"
        document.body.appendChild(gui.domElement)

        return () =>
        {
            gui.destroy()
        }
    }, [])

    return null
}
