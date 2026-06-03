import { useEffect, useMemo, useState } from "react"

import { InfoBox } from "../components/InfoBox"
import { BlueSkyLogo, GitHubLogo, MailIcon } from "../components/svgs"
import { CountryData, extended_countries_data, get_country_by_code } from "../data/countries"
import { CountryISO2Code } from "../data/countries_data"
import pub_sub from "../sim_3d/state/pub_sub"
import { Link } from "./Link"
import "./SelectCountry.css"


type LocalUserVotesByCountryCode2 = Partial<Record<CountryISO2Code, boolean>>


const on_wikisim = document.URL.includes("https://wikisim-server.wikisim.deno.net")

interface SelectCountryProps
{
    selected_country_ISO2: CountryISO2Code
}
export function SelectCountry(props: SelectCountryProps)
{
    const [show_info_box, set_show_info_box] = useState(false)
    const [filter_text, set_filter_text] = useState("")
    const initial_user_votes_by_country_code2 = useMemo(() => get_local_user_votes_by_country_code2(), [])
    const [user_votes_by_country_code2, set_user_votes_by_country_code2] = useState(initial_user_votes_by_country_code2)

    const country = get_country_by_code(props.selected_country_ISO2)

    const filtered_countries = extended_countries_data
        .filter(c => c.name.toLowerCase().includes(filter_text) || c.code2.toLowerCase().includes(filter_text)  || c.code3.toLowerCase().includes(filter_text))

    const implemented_countries = filtered_countries.filter(c => c.implemented)
    const unimplemented_countries = filtered_countries.filter(c => !c.implemented)
        .sort((a, b) => b.votes - a.votes) // show the most voted for unimplemented countries at the top


    useEffect(() => pub_sub.sub("show_select_country", () =>
    {
        set_show_info_box(true)
    }), [])

    return (
        <div
            id="select_country"
            className={"ui_button " + (on_wikisim ? "on_wikisim" : "")}
            onClick={() => set_show_info_box(true)}
        >
            <span style={{ fontSize: "24px" }}>{country?.emoji}</span>

            {show_info_box && <InfoBox
                message={
                    <>
                        <h1>Vote for a Country</h1>
                        <p>
                            Press ⚡ to vote for a country to be added to this
                            simulation.
                        </p>
                        {/* <p>
                            I hope you enjoyed and learnt something, if so <a href="https://www.patreon.com/WikiSim">we'd be grateful for your support to let us do more ❤️</a>
                        </p> */}

                        <Filter set_filter_text={set_filter_text} />

                        <div id="countries_list">
                            {implemented_countries.length > 0 && <div className="countries_list_first_sub_heading">
                                IMPLEMENTED ({implemented_countries.length}):
                            </div>}

                            {implemented_countries.map(c => <CountryRow
                                key={c.code2}
                                country={c}
                                user_votes_by_country_code2={user_votes_by_country_code2}
                                set_user_votes_by_country_code2={set_user_votes_by_country_code2}
                            />)}

                            <div className="countries_list_second_sub_heading">
                                NOT IMPLEMENTED YET ({unimplemented_countries.length}):
                            </div>

                            {unimplemented_countries.map(c => <CountryRow
                                key={c.code2}
                                country={c}
                                user_votes_by_country_code2={user_votes_by_country_code2}
                                set_user_votes_by_country_code2={set_user_votes_by_country_code2}
                            />)}
                        </div>

                        <SubscribeOrFollow
                            user_votes_by_country_code2={user_votes_by_country_code2}
                            initial_user_votes_by_country_code2={initial_user_votes_by_country_code2}
                        />

                        <p>
                            I hope you enjoyed and learnt something from this simulation.
                            It took a lot of work to make this so please consider <Link url="https://www.patreon.com/WikiSim">donating ❤️</Link>
                        </p>
                    </>
                }
                confirmation_button={({ close_info_box }) =>
                {
                    return <button onClick={close_info_box}>Close</button>
                }}
                on_close={() => set_show_info_box(false)}
            />}
        </div>
    )
}


function Filter(props: { set_filter_text: (text: string) => void })
{
    return <p style={{ display: "flex", marginBottom: 0 }}>
        <input
            type="text"
            placeholder="Filter countries..."
            onChange={(e) => props.set_filter_text(e.target.value.toLowerCase())}
            style={{ flexGrow: 1, padding: "8px", marginBottom: "10px" }}
        />
    </p>
}


interface CountryRowProps
{
    key: string
    country: CountryData
    user_votes_by_country_code2: LocalUserVotesByCountryCode2
    set_user_votes_by_country_code2: (votes: LocalUserVotesByCountryCode2) => void
}
function CountryRow(props: CountryRowProps)
{
    const { country } = props
    const user_vote = props.user_votes_by_country_code2[country.code2] ? 1 : 0

    return <div className="country_row">
        <div>
            {country.emoji} {country.name}
        </div>
        <button
            style={{
                padding: "2px 10px",
                backgroundColor: user_vote ? "#ffcc00" : "initial",
            }}
            onClick={() =>
            {
                const new_votes = {
                    ...props.user_votes_by_country_code2,
                    [country.code2]: props.user_votes_by_country_code2[country.code2] || false,
                }
                new_votes[country.code2] = !new_votes[country.code2]

                if (new_votes[country.code2])
                {
                    // This (may) get logged to Sentry as a cheap way for us to
                    // track if users are upvoting for a country.  We can manually
                    // go through the logs to check & count which countries are getting upvotes.
                    console.info(`User upvoted country ${country.code2} ${country.name}`)
                }
                else
                {
                    delete new_votes[country.code2]
                }

                props.set_user_votes_by_country_code2(new_votes)
                set_local_user_votes_by_country_code2(new_votes)
            }}
        >
            {country.votes + user_vote}&nbsp;⚡
        </button>
    </div>
}


interface SubscribeOrFollowProps
{
    user_votes_by_country_code2: LocalUserVotesByCountryCode2
    initial_user_votes_by_country_code2: LocalUserVotesByCountryCode2
}
function SubscribeOrFollow(props: SubscribeOrFollowProps)
{
    const has_voted = JSON.stringify(props.user_votes_by_country_code2) !== JSON.stringify(props.initial_user_votes_by_country_code2)

    return <p id="subscribe_or_follow" className={has_voted ? "visible" : "hidden"}>
        <Link url="https://docs.google.com/forms/d/e/1FAIpQLSdKpO2KkvlXnhEoo9VejTID8tfGbHA_BEbZuFrsAku_TahH8w/viewform?entry.1843888779=">Subscribe <MailIcon style={{ height: 18 }} /> </Link>
        to be notified when this country is added... or
        lend us a hand on <Link url="https://github.com/AJamesPhillips/energy-explorer-v2/issues/new?title=[REQUEST]%20I%27d%20like%20to%20be%20able%20to%20play%20country%20...">GitHub <GitHubLogo height={18} /> </Link>
        or <Link url="https://bsky.app/profile/ajamesphillips.com">BlueSky <BlueSkyLogo height={18} /></Link>
    </p>
}


function get_local_user_votes_by_country_code2(): LocalUserVotesByCountryCode2
{
    const votes_str = localStorage.getItem("country_votes")
    if (!votes_str) return {}

    try
    {
        const votes = Object.entries(JSON.parse(votes_str))
            .filter(([_, voted]) => voted)
        return Object.fromEntries(votes)
    }
    catch (e)
    {
        console.error("Error parsing country votes from localStorage", e)
        return {}
    }
}


function set_local_user_votes_by_country_code2(votes: LocalUserVotesByCountryCode2)
{
    localStorage.setItem("country_votes", JSON.stringify(votes))
}
