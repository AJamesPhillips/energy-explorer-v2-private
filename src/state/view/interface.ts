
export type ViewAngle = "top_down" | "isometric" | "partial"

export type CapacityFactorsSource = "wind" | "solar"
export type CapacityFactorsAggregation = "hourly" | "annual_average"
export type SetMapCapacityFactors = (source: CapacityFactorsSource | undefined | false, aggregation?: CapacityFactorsAggregation, discrete?: boolean) => void

export interface ViewState
{
    angle: ViewAngle
    set_angle: (new_angle: ViewAngle) => void
    map_capacity_factors_source: CapacityFactorsSource | false
    map_capacity_factors_aggregation: CapacityFactorsAggregation
    map_capacity_factors_discrete: boolean
    set_map_capacity_factors: SetMapCapacityFactors
}
