
// Country ISO 3166-1 numeric IDs to highlight
export const UK_ID = "826"

const IRELAND_ID = "372"
// const FRANCE_ID = "250"
// const NETHERLANDS_ID = "528"
// const BELGIUM_ID = "056"
// const GERMANY_ID = "276"
// const DENMARK_ID = "208" // & Faroe Islands
// const NORWAY_ID = "578"

export const NEARBY_COUNTRY_IDS = new Set([
    IRELAND_ID,
    // Do not include other countries for now as there seems to be problems
    // rendering their geometries
    // FRANCE_ID,
    // NETHERLANDS_ID,
    // BELGIUM_ID,
    // GERMANY_ID,
    // DENMARK_ID,
    // NORWAY_ID,
])


export interface ScreenPointFudge
{
    x: number
    y: number
}
export const UK_SCREEN_POINT_FUDGE: ScreenPointFudge =
{
    x: 200,
    y: -1210,
}
