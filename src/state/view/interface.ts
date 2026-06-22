
export type ViewAngle = "top_down" | "isometric" | "partial"

export type CapacityFactorsSource = "wind" | "solar"
export type CapacityFactorsAggregation = "hourly" | "annual_average"
export type SetMapCapacityFactors = (source: CapacityFactorsSource | false, aggregation?: CapacityFactorsAggregation) => void

export interface ViewState
{
    angle: ViewAngle
    set_angle: (new_angle: ViewAngle) => void
    map_capacity_factors_source: CapacityFactorsSource | false
    map_capacity_factors_aggregation: CapacityFactorsAggregation
    set_map_capacity_factors: SetMapCapacityFactors
}
