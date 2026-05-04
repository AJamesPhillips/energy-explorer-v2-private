import { useState } from "react"
import { GraphLogo } from "../../../components/svgs"
import "./ui.css"


export function DataPortal()
{
    const [show_data_portal, set_show_data_portal] = useState<boolean>(false)

    return <div>
        <span
            className="ui_button"
            onClick={() => set_show_data_portal(true)}
        >
            Data <GraphLogo style={{ marginLeft: 5 }} />
        </span>
    </div>
}
