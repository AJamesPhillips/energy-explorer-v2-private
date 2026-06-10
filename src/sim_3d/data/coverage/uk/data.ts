import {
    OffshoreAreaTypeAndTotal,
    SimplifiedLandAreaTypeAndTotal,
    uk_land_coverage_simplified,
} from "../../coverage_land/uk/data"
import { uk_eez_area, uk_offshore_shallow_area } from "../../coverage_offshore/uk/data"


interface AreaInfo
{
    total_area_km2: number
    land_ratio: number | null
    offshore_ratio: number | null
    ratio: number
}

export type UKAreaTypes = SimplifiedLandAreaTypeAndTotal | OffshoreAreaTypeAndTotal | "total_uk"

export const uk_coverage: Record<UKAreaTypes, AreaInfo> = Object.entries(uk_land_coverage_simplified)
    .map(([ area_type, land_info ]) =>
    {
        return [ area_type as SimplifiedLandAreaTypeAndTotal, {
            total_area_km2: land_info.total_area_km2,
            land_ratio: land_info.land_ratio,
            offshore_ratio: null,
            ratio: 0
        } ] as const
    })
    .reduce((acc, [ area_type, info ]) =>
    {
        acc[area_type] = info
        return acc
    }, {} as Record<UKAreaTypes, AreaInfo>)

// Add offshore areas to the coverage data.
uk_coverage.shallow = {
    total_area_km2: uk_offshore_shallow_area,
    land_ratio: null,
    offshore_ratio: uk_offshore_shallow_area / uk_eez_area,
    ratio: 0
}
uk_coverage.deep = {
    total_area_km2: uk_eez_area - uk_offshore_shallow_area,
    land_ratio: null,
    offshore_ratio: (uk_eez_area - uk_offshore_shallow_area) / uk_eez_area,
    ratio: 0
}
uk_coverage.total_offshore = {
    total_area_km2: uk_eez_area,
    land_ratio: null,
    offshore_ratio: (uk_eez_area - uk_offshore_shallow_area) / uk_eez_area,
    ratio: 0
}

// Add total UK area to the coverage data.
uk_coverage.total_uk = {
    total_area_km2: uk_coverage.total_land.total_area_km2 + uk_coverage.total_offshore.total_area_km2,
    land_ratio: 1,
    offshore_ratio: 1,
    ratio: 1
}

// Calculate the ratio of each area
Object.values(uk_coverage).forEach(info =>
{
    info.ratio = info.total_area_km2 / uk_coverage.total_uk.total_area_km2
})
