import { LandOrSeaType } from "../data/coverage_land/uk/data"


const subtype_to_colour: Record<LandOrSeaType, string> = {
    woodland:     "#228B22",
    arable:       "#DEB887",
    grassland:    "#7CFC00",
    wetland:      "#698b2e",
    rock:         "#A9A9A9",
    inland_water: "#399cff",
    urban:        "#696969",
    suburban:     "#D3D3D3",
    non_territory_land: "#d2ffd1",

    shallow:      "#0d84fa",
    deep:         "#0a5096",
    non_territory_sea: "#dae6ff",
}

export function tile_colour(subtype: LandOrSeaType | undefined): string
{
    const colour = subtype ? subtype_to_colour[subtype] : ""
    return colour || "#FFFFFF"
}
