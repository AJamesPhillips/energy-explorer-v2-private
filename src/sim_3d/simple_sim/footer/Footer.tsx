import { useState } from "react"

import { InfoBox } from "../../../components/InfoBox"
import { Link } from "../../../components/Link"
import { InfoBoxSelectCountry } from "../../../components/SelectCountry"
import { GitHubLogo, MagnifyingGlassIcon, MailIcon } from "../../../components/svgs"
import { get_country_by_code } from "../../../data/countries"
import { is_narrow_screen } from "../../../utils/screen_type"
import pub_sub from "../../state/pub_sub"
import { ActionOptions } from "./ActionOptions"
import "./Footer.css"


export function Footer()
{
    const [view, set_view] = useState<false | "info" | "country_vote">(false)

    return <div id="app_footer">
        {/* {false && <div className="footer_row">
            <TileInfo />
        </div>} */}

        <ActionOptions />

        <div className="footer_row">
            <div className="ui_button" onClick={() => set_view("info")}>
                {is_narrow_screen() ? <>❤️</> : <span>Subscribe <MailIcon style={{ height: 24 }} /> / Donate ❤️</span>}
            </div>
        </div>

        {view === "info" && <InfoBox
            message={
                <div style={{ whiteSpace: ""}}>
                    If you enjoyed this please share it.
                    You can also <Link
                        url="https://docs.google.com/forms/d/e/1FAIpQLSdKpO2KkvlXnhEoo9VejTID8tfGbHA_BEbZuFrsAku_TahH8w/viewform"
                        noWrap={true}
                    >
                        subscribe <MailIcon style={{ height: 14 }} />
                    </Link>{" "}
                    <Link
                        url="mailto:hello@wikisim.org"
                        noWrap={true}
                    >
                        email us <MailIcon style={{ height: 14 }} />
                    </Link>{" "}
                    check the <a href="" style={{ whiteSpace: "nowrap" }} onClick={e =>
                    {
                        set_view(false)
                        e.preventDefault()
                        pub_sub.pub("show_info_and_data_sources", true)
                    }}>data <MagnifyingGlassIcon height={14} /></a>{" "}
                    <Link
                        url="https://github.com/AJamesPhillips/energy-explorer-v2/issues"
                        noWrap={true}
                    >
                        code <GitHubLogo height={14} />
                    </Link>{" "}

                    <p>
                        This simulation took a lot of work to make this so please
                        consider <Link
                            url="https://www.patreon.com/WikiSim"
                            style={{ whiteSpace: "nowrap" }}
                        >
                            donating ❤️
                        </Link>
                    </p>

                    <p>
                        You're viewing {get_country_by_code("GB")?.emoji} If you'd like to see a simulation of a different
                        country <a href="" onClick={e =>
                        {
                            e.preventDefault()
                            set_view("country_vote")
                        }}>
                            please vote for it
                        </a>.
                    </p>
                </div>
            }
            on_close={() => set_view(false)}
        />}

        {view === "country_vote" && <InfoBoxSelectCountry on_close={() => set_view(false)} />}
    </div>
}
