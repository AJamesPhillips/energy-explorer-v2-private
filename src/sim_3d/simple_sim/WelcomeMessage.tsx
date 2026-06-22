import { OnceOffInfoBox } from "../../components/InfoBox"
import { Link } from "../../components/Link"
import { MailIcon } from "../../components/svgs"
import { WarningAppUnderConstruction } from "../../components/WarningAppUnderConstruction"


const should_show = true || document.location.hostname !== "localhost"

export function WelcomeMessage1()
{
    if (!should_show) return null

    return <OnceOffInfoBox
        id="simple_sim_welcome_message"
        message={() =>
            <>
                <h1>⚡️Power the UK⚡️</h1>

                {/* <p>
                    This is a simplification of the UK's national energy system.
                </p> */}

                <p style={{ textAlign: "center" }}>
                    It's 2026.
                    <br/>Your job is to prepare the country's energy system to survive
                    natural disasters, supply shocks, and hostile powers!
                </p>

                <p style={{ textAlign: "center", backgroundColor: "#fffae6", padding: 8, borderRadius: 4, border: "1px solid #ffe58f" }}>
                    Build power plants, storage, grid, and change government policies.  Good luck!
                </p>
                {/* And click on ℹ️ symbols to get more information */}



                {/* <p>
                    Or <a
                        onClick={e =>
                        {
                            e.preventDefault()
                            close_info_box()
                            pub_sub.pub("show_select_country", undefined)
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        vote for your own country
                    </a>.
                </p> */}


                {/* <p>
                    Note: each grid square is about 35 km × 35 km (≈ 1250 km²) and only ⅓ of the
                    sea in the UK's exclusive economic zone is shown, the real area of the UK
                    land and sea is twice as large!
                </p> */}
            </>
        }
        confirmation_button_text="Let's go!"
        hide_offer_to_not_show_again={true}
    />
}


export function WelcomeMessage2()
{
    if (!should_show) return null

    return <OnceOffInfoBox
        id="simple_sim_welcome_message"
        message={() =>
            <>
                <h1>Warning</h1>

                <WarningAppUnderConstruction
                    custom_message={<>
                        Whilst this simulation strives to be accurate, there are still be significant over simplifications and inaccuracies.  Please do not yet use this simulation to make real-world decisions.
                    </>}
                />

                <p style={{ textAlign: "center" }}>
                    <Link
                        url="https://docs.google.com/forms/d/e/1FAIpQLSdKpO2KkvlXnhEoo9VejTID8tfGbHA_BEbZuFrsAku_TahH8w/viewform"
                        noWrap={true}
                    >
                        Subscribe <MailIcon style={{ height: 14 }} />
                    </Link> to hear about updates and improvements
                </p>
            </>
        }
        hide_offer_to_not_show_again={true}
    />
}
