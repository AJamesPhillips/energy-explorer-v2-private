

export type BuildingStorageAction = {
    type: "hydro_pumped_storage" | "battery"
}
export type BuildingOilGasAction = {
    type: "oil_and_gas_rig"
}
export type BuildingElectricityAction = {
    type: "gas" | "hydro_river" | "nuclear" | "solar" | "wind"
}
export type BuildingDestroyAction = {
    type: "bulldozer"
}
export type BuildingActionType = (
    BuildingElectricityAction
    | BuildingOilGasAction
    | BuildingStorageAction
    | BuildingDestroyAction
)
export type BuildingActionTypeString = BuildingActionType["type"]
export type ActiveBuildingAction = false | BuildingActionType

export interface BuildingActionState
{
    active: ActiveBuildingAction
    set_building_action: (build_action: ActiveBuildingAction) => void
}
