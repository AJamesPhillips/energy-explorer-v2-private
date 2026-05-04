import { useEffect, useState } from "react"

import { InfoBox } from "../../../components/InfoBox"
import { Link } from "../../../components/Link"
import { InfoLogo } from "../../../components/svgs"
import { asset_url } from "../../../utils/asset_url"
import { is_narrow_screen } from "../../../utils/screen_type"
import pub_sub from "../../state/pub_sub"
import { InfoSectionId } from "../../state/pub_sub/interface"
import "./ui.css"
const SEWTHA_url = asset_url("/imgs/SEWTHA_book_cover.png")
const bgs_url = asset_url("/imgs/logos_BGS.png")
const ons_url = asset_url("/svgs/logos_ONS.svg")
const ukceh_url = asset_url("/imgs/logos_UKCEH.png")


export function Info()
{
    const [show_info_box, set_show_info_box] = useState<InfoSectionId | boolean>(false)

    useEffect(() => pub_sub.sub("show_info_and_data_sources", set_show_info_box), [])

    useEffect(() => {
        if (!show_info_box || show_info_box === true) return

        // Scroll to the relevant section of the info box if it's already open
        const id = "info_section_" + show_info_box
        const element = document.getElementById(id)
        if (element) element.scrollIntoView({ behavior: "smooth" })
    }, [show_info_box])

    return <div
        className="ui_button"
        onClick={() => set_show_info_box(true)}
    >
        <span>
            {is_narrow_screen() ? "" : "Sources "}<InfoLogo style={{ marginLeft: is_narrow_screen() ? 0 : 5 }} />
        </span>

        {show_info_box && <InfoBox
            wider_info_box={true}
            message={<>
                <h1>Data Sources <InfoLogo style={{ height: 30 }} /></h1>

                <div style={{ overflowY: "scroll", maxHeight: "50vh", paddingRight: 10 }}>
                    <p>
                        This is a simplified simulation of the UK's energy system, focused
                        on renewable energy generation and demand.
                    </p>

                    <Section id="map" title="The map" />
                    <p>
                        The map is divided into 400 squares, each representing about
                        35 km × 35 km (≈ 1250 km²) of land or sea. Only ⅓ of the sea
                        in the UK's exclusive economic zone (sea) is shown, so the real
                        area of the UK land and sea is twice as large.  The UK is mostly sea!
                    </p>
                    <p>
                        The <Link url="https://wikisim.org/wiki/1261">data for the map</Link> is based on
                        the land coverage data from
                        the UK's Centre for Ecology and Hydrology
                    </p>
                    <LogoImg src={ukceh_url} alt="UKCEH logo" url="https://www.ceh.ac.uk" />

                    <p>
                        And the sea areas are the:
                        <ul>
                            <li>
                                <Link url="https://wikisim.org/wiki/1267">UK's exclusive economic zone (EEZ)</Link> from
                                Sea Around Us - a research initiative at the University of British Columbia and the University of Western Australia.
                            </li>
                            <li>
                                <Link url="https://wikisim.org/wiki/1268">UK's offshore shallow area</Link> from
                                the University of Southampton's IROE (Intelligent and Resilient Ocean Engineering) group
                                referencing data from British Geological Survey
                            </li>
                        </ul>
                    </p>
                    <LogoImg src={bgs_url} alt="BGS logo" url="https://www.bgs.ac.uk"/>


                    <Section id="population" title="Population" />
                    <p>
                        The <Link url="https://wikisim.org/wiki/1011">UK population data</Link> is from
                        the UK's Office for National Statistics
                    </p>
                    <LogoImg src={ons_url} alt="ONS logo" url="https://www.ons.gov.uk/" height={43} />


                    <Section id="power_demand" title="Power demand" />
                    <p>
                        The <Link url="https://wikisim.org/wiki/1239">power demand data</Link> is a
                        complicated topic and is based largely on the
                        2009 book by Professor David MacKay "Sustainable Energy - without the hot air", with
                        some minor adjustments and updates e.g. to include data centre
                        power usage.
                    </p>
                    <LogoImg
                        src={SEWTHA_url}
                        alt="Sustainable Energy - without the hot air book cover"
                        url="https://www.withouthotair.com/"
                        height={100}
                    />
                    <p>
                        The "total_demand" value is used from the <Link url="https://wikisim.org/wiki/1239">power demand data</Link>.
                        It's units are in kW hours per person per day.  To convert into
                        the GW value shown in the simulation, it is multiplied by the population as well as
                        converting from kW hours per day to GW.
                    </p>


                    <Section id="power_supply" title="Power Supply" />
                    <p>
                        The power supply data is similarly based on Professor David MacKay's
                        book.  In this case rather than using the single high level "total_supply"
                        value, instead the component values of the calculations are used to calculate the power supply.
                    </p>
                    <p>
                        For example:
                        <ul>
                            <li>
                                The <Link url="https://wikisim.org/wiki/1276">offshore wind power density of 3 W/m²</Link>
                            </li>
                            <li>
                                The <Link url="https://wikisim.org/wiki/1275">onshore wind power density of 2 W/m²</Link>
                            </li>
                            <li>
                                The <Link url="https://wikisim.org/wiki/1204">solar PV farm power density of 5 W/m²</Link>
                            </li>
                            <li>
                                The <Link url="https://wikisim.org/wiki/1201">residential PV power density of 22 W/m²</Link> which is
                                used in conjunction with the <Link url="https://wikisim.org/wiki/1273">Ratio of south facing roofs in UK to area of built up land</Link> to get the
                                <Link url="https://wikisim.org/wiki/1274">Potential solar PV power for built areas in UK</Link> of 0.63 W/m²
                            </li>
                        </ul>
                    </p>


                    <Section id="oil_and_gas_reserves" title="Oil and Gas Reserves" />
                    <p>
                        The data for the oil and gas reserves is based on... (TODO)
                    </p>

                    <Section id="motivation" title="Motivation for this sim" />
                    <p>
                        To get a better intuitive understanding of the scale of
                        energy demand and the resources and area required to
                        build renewable energy generation or other sources of energy.
                    </p>

                    <p>
                        It's dedicated to the
                        memory of Professor David MacKay, who inspired so many of us.  And given
                        with thanks to all our teachers, mentors and supporters.
                    </p>
                </div>
            </>}
            on_close={() => set_show_info_box(false)}
        />}
    </div>
}


function Section(props: { id: InfoSectionId, title: string })
{
    return <p style={{ marginTop: 50 }} id={"info_section_" + props.id }>
        <b style={{ fontSize: "var(--font-medium)" }}>
            {props.title.toUpperCase()}
        </b>
    </p>
}


function LogoImg(props: { src: string, alt: string, url: string, height?: number })
{
    const { height = 50 } = props

    return <p style={{ textAlign: "center" }}>
        <Link url={props.url}>
            <img src={props.src} style={{ margin: "auto", height }} />
        </Link>
    </p>
}
