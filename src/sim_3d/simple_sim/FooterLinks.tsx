import { useState } from "react"

import { InfoBox } from "../../components/InfoBox"
import { Link } from "../../components/Link"
import { GitHubLogo, MagnifyingGlassLogo, MailLogo } from "../../components/svgs"
import { is_narrow_screen } from "../../utils/screen_type"
import pub_sub from "../state/pub_sub"
import "./FooterLinks.css"


export function FooterLinks()
{
    const [show_contact_info, set_show_contact_info] = useState(false)

    return <div id="app_footer">
        <div className="footer_row">
            <div className="ui_button" onClick={() => set_show_contact_info(true)}>
                {is_narrow_screen() ? <>❤️</> : <span>Subscribe <MailLogo style={{ height: 24 }} /> / Donate ❤️</span>}
            </div>
        </div>

        {show_contact_info && <InfoBox
            message={
                <div style={{ whiteSpace: ""}}>
                    If you enjoy this please share it.
                    You can <Link
                        url="https://docs.google.com/forms/d/e/1FAIpQLSdKpO2KkvlXnhEoo9VejTID8tfGbHA_BEbZuFrsAku_TahH8w/viewform"
                        noWrap={true}
                    >
                        subscribe <MailLogo style={{ height: 14 }} />
                    </Link>{" "}
                    <Link
                        url="mailto:hello@wikisim.org"
                        noWrap={true}
                    >
                        email us <MailLogo style={{ height: 14 }} />
                    </Link>{" "}
                    check the <a href="" style={{ whiteSpace: "nowrap" }} onClick={e =>
                    {
                        e.preventDefault()
                        pub_sub.pub("show_info_and_data_sources", true)
                    }}>data <MagnifyingGlassLogo height={14} /></a>{" "}
                    <Link
                        url="https://github.com/AJamesPhillips/energy-explorer-v2/issues"
                        noWrap={true}
                    >
                        code <GitHubLogo height={14} />
                    </Link>{" "}
                    or <Link
                        url="https://www.patreon.com/WikiSim"
                        noWrap={true}
                    >
                        donate ❤️
                    </Link>

                    <p>
                        I hope you enjoyed and learnt something from this simulation.
                        It took a lot of work to make this so please
                        consider <a
                            href="https://www.patreon.com/WikiSim"
                            style={{ whiteSpace: "nowrap" }}
                        >
                            donating ❤️
                        </a>
                    </p>
                </div>
            }
            on_close={() => set_show_contact_info(false)}
        />}
    </div>
}
