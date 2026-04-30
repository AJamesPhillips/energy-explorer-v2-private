import { Link } from "../../components/Link"
import { GitHubLogo, MagnifyingGlassLogo, MailLogo } from "../../components/svgs"
import pub_sub from "../state/pub_sub"
import "./FooterLinks.css"


export function FooterLinks()
{
    return <div id="footer_links">
        If you enjoy this please share it.
        You can <Link url="https://docs.google.com/forms/d/e/1FAIpQLSdKpO2KkvlXnhEoo9VejTID8tfGbHA_BEbZuFrsAku_TahH8w/viewform">Subscribe <MailLogo height={14} /></Link>,{" "}
        <Link url="mailto:hello@wikisim.org">Email us <MailLogo height={14} /></Link>,{" "}
        <a href="" onClick={e =>
        {
            e.preventDefault()
            pub_sub.pub("show_info_and_data_sources", true)
        }}>Check the data <MagnifyingGlassLogo height={14} /></a>,{" "}
        <Link url="https://github.com/AJamesPhillips/energy-explorer-v2/issues">Code <GitHubLogo height={14} /></Link>,{" "}
        or <Link url="https://www.patreon.com/WikiSim">Donate to support us to do more ❤️</Link>
    </div>
}
