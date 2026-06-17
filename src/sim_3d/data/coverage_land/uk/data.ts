

// Copied from github.com/theWorldSim/world-sim-data/tree/master/data/land_coverage/uk/plot_dominant_land_coverage_h3_cells.py
const THRESHOLD_DOMINANT_COVERAGE_TYPE_PERCENTAGE = 21411 / 2

export async function get_uk_land_coverage()
{
    const gb = await process_land_coverage("data/land_coverage/gb_dominant_land_coverage_h3_r5.json")
    const ni = await process_land_coverage("data/land_coverage/ni_dominant_land_coverage_h3_r5.json")

    return [...gb, ...ni]
}


interface RawLandH3Cell
{
    h3_cell_id: string
    dominant_simplified_coverage_type: SimplifiedLandAreaType
    dominant_simplified_coverage_type_percentage: number
}
export interface LandH3Cell
{
    id: string
    type: SimplifiedLandAreaType
}
async function process_land_coverage(data_path: string): Promise<LandH3Cell[]>
{
    return fetch(data_path)
        .then(response => response.json())
        .then((entries: RawLandH3Cell[]) => entries.filter(e =>
        {
            return e.dominant_simplified_coverage_type_percentage > THRESHOLD_DOMINANT_COVERAGE_TYPE_PERCENTAGE
        }).map(e => ({
            id: e.h3_cell_id,
            type: e.dominant_simplified_coverage_type
        })))
}


// Old land coverage data copied and pasted from https://wikisim.org/wiki/1261
// TODO have this data pulled from latest WikiSim version

export const uk_land_coverage = [
    [
        "country name",
        "area_m2_Broadleaved woodland",
        "area_m2_Coniferous Woodland",
        "area_m2_Arable and Horticulture",
        "area_m2_Improved Grassland",
        "area_m2_Neutral Grassland",
        "area_m2_Calcareous Grassland",
        "area_m2_Acid grassland",
        "area_m2_Fen, Marsh and Swamp",
        "area_m2_Heather",
        "area_m2_Heather grassland",
        "area_m2_Bog",
        "area_m2_Inland Rock",
        "area_m2_Saltwater",
        "area_m2_Freshwater",
        "area_m2_Supralittoral Rock",
        "area_m2_Supralittoral Sediment",
        "area_m2_Littoral Rock",
        "area_m2_Littoral sediment",
        "area_m2_Saltmarsh",
        "area_m2_Urban",
        "area_m2_Suburban"
    ],
    [
        "England",
        12690951100,
        3031735300,
        39504402000,
        44457852100,
        863323000,
        1750148100,
        3849831300,
        396823200,
        1652772600,
        1112039500,
        2062988300,
        272582200,
        3855000,
        848533600,
        80421000,
        157675200,
        9928100,
        83897200,
        343424300,
        5084027900,
        12125097400
    ],
    [
        "Northern Ireland",
        1025199800,
        574809100,
        607083200,
        6747571600,
        1606531500,
        52052500,
        611566900,
        91868600,
        315599800,
        498219400,
        595395600,
        14873100,
        122459500,
        587017900,
        9171200,
        25675100,
        13723600,
        42575400,
        2606000,
        147524300,
        616132900
    ],
    [
        "Scotland",
        4966744100,
        8982871000,
        5784676200,
        13218268700,
        201678600,
        37262700,
        12921074600,
        120993700,
        6718334600,
        10276277300,
        6942320100,
        1275491600,
        1199100,
        1472651600,
        202701100,
        233668400,
        103581200,
        7220000,
        40371400,
        432146900,
        1819027800
    ],
    [
        "Wales",
        2361331100,
        1462266600,
        837394400,
        9541350100,
        209460300,
        3424300,
        3151997500,
        137589400,
        536727800,
        449253700,
        301670900,
        59425100,
        236000,
        97562000,
        54827900,
        80643400,
        227400,
        9827300,
        68209900,
        320016500,
        1086029800
    ]
]

type LandAreaType = (
    | "Broadleaved woodland"
    | "Coniferous Woodland"
    | "Arable and Horticulture"
    | "Improved Grassland"
    | "Neutral Grassland"
    | "Calcareous Grassland"
    | "Acid grassland"
    | "Fen, Marsh and Swamp"
    | "Heather"
    | "Heather grassland"
    | "Bog"
    | "Inland Rock"
    | "Saltwater"
    | "Freshwater"
    | "Supralittoral Rock"
    | "Supralittoral Sediment"
    | "Littoral Rock"
    | "Littoral sediment"
    | "Saltmarsh"
    | "Urban"
    | "Suburban"
)

export type SimplifiedLandAreaType = (
    | "woodland"
    | "arable"
    | "grassland"
    | "wetland"
    | "rock"
    | "inland_water"
    | "urban"
    | "suburban"
)
export const SIMPLIFIED_LAND_AREA_TYPES: SimplifiedLandAreaType[] = [
    "woodland",
    "arable",
    "grassland",
    "wetland",
    "rock",
    "inland_water",
    "urban",
    "suburban"
]
export type SimplifiedLandAreaType2 = SimplifiedLandAreaType | (
    | "non_territory_land"
)

export type OffshoreAreaType = "shallow" | "deep" | "non_territory_sea"

// Copied between:
// https://wikisim.org/wiki/1261v5 (in the code)
// https://github.com/AJamesPhillips/energy-explorer-v2/blob/c7f2921/src/sim_3d/data/coverage_land/uk/data.ts#L167-L189
// and https://github.com/theWorldSim/world-sim-data/tree/master/data/land_coverage/uk/process.py
const map_simplified_area_type: Record<LandAreaType, SimplifiedLandAreaType> = {
    "Broadleaved woodland": "woodland",
    "Coniferous Woodland": "woodland",
    "Arable and Horticulture": "arable",
    "Improved Grassland": "grassland",
    "Neutral Grassland": "grassland",
    "Calcareous Grassland": "grassland",
    "Acid grassland": "grassland",
    "Fen, Marsh and Swamp": "wetland",
    "Heather": "grassland",
    "Heather grassland": "grassland",
    "Bog": "wetland",
    "Inland Rock": "rock",
    "Saltwater": "inland_water",
    "Freshwater": "inland_water",
    "Supralittoral Rock": "rock",
    "Supralittoral Sediment": "rock",
    "Littoral Rock": "rock",
    "Littoral sediment": "rock",
    "Saltmarsh": "wetland",
    "Urban": "urban",
    "Suburban": "suburban"
}

export type SimplifiedLandAreaTypeAndTotal = SimplifiedLandAreaType2 | "total_land"
export type OffshoreAreaTypeAndTotal = OffshoreAreaType | "total_offshore"

export type LandOrSea = {
    type: "land"
    subtype: SimplifiedLandAreaType2
} | {
    type: "sea"
    subtype: OffshoreAreaType
}


export type LandOrSeaType = SimplifiedLandAreaType2 | OffshoreAreaType


export const land_or_sea_types: Record<LandOrSeaType, LandOrSea & { human_readable: string }> = {
    woodland:     { type: "land", subtype: "woodland",     human_readable: "Woodland" },
    arable:       { type: "land", subtype: "arable",       human_readable: "Arable" },
    grassland:    { type: "land", subtype: "grassland",    human_readable: "Grassland" },
    suburban:     { type: "land", subtype: "suburban",     human_readable: "Suburban" },
    urban:        { type: "land", subtype: "urban",        human_readable: "Urban" },
    rock:         { type: "land", subtype: "rock",         human_readable: "Rock" },
    wetland:      { type: "land", subtype: "wetland",      human_readable: "Wetland" },
    inland_water: { type: "land", subtype: "inland_water", human_readable: "Inland Water" },
    non_territory_land: { type: "land", subtype: "non_territory_land", human_readable: "Non-territory Land" },

    shallow: { type: "sea", subtype: "shallow", human_readable: "Shallow Sea" },
    deep:    { type: "sea", subtype: "deep",    human_readable: "Deep Sea" },
    non_territory_sea: { type: "sea", subtype: "non_territory_sea", human_readable: "Non-territory Sea" },
}


interface LandAreaInfo
{
    total_area_km2: number
    land_ratio: number
}
export const uk_land_coverage_simplified: Record<SimplifiedLandAreaTypeAndTotal, LandAreaInfo> = uk_land_coverage.slice(1)
    .reduce((acc, row) =>
    {
        // const country_name = row[0] as string
        const area_types = row.slice(1) as number[]
        area_types.forEach((area_in_m2, index) =>
        {
            const raw_area_type = uk_land_coverage[0]![index + 1]! as string
            const area_type = raw_area_type.replace("area_m2_", "") as LandAreaType
            const simplified_area_type = map_simplified_area_type[area_type]
            if (!simplified_area_type) throw new Error("No simplified area type for area type: " + area_type)

            if (!acc[simplified_area_type]) acc[simplified_area_type] = { total_area_km2: 0, land_ratio: 0 }
            const area_in_km2 = area_in_m2 / 1e6  // Convert from m2 to km2
            acc[simplified_area_type].total_area_km2 += area_in_km2
        })

        return acc
    }, {} as Record<SimplifiedLandAreaTypeAndTotal, LandAreaInfo>)

// Add the total area as the sum of all other areas, for convenience.
uk_land_coverage_simplified.total_land = {
    total_area_km2: Object.values(uk_land_coverage_simplified)
        .reduce((sum, area_info) => sum + area_info.total_area_km2, 0),
    land_ratio: 1
}

// Calculate the ratio of each area type to the total area, for convenience.
Object.values(uk_land_coverage_simplified).forEach(area_info =>
{
    area_info.land_ratio = area_info.total_area_km2 / uk_land_coverage_simplified.total_land.total_area_km2
})

// Round the values in uk_land_coverage_simplified
Object.values(uk_land_coverage_simplified).forEach(area_info =>{
    area_info.total_area_km2 = Math.round(area_info.total_area_km2)
})
