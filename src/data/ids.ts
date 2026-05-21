import { IdAndMaybeVersion, IdOnly, parse_id } from "core/data/id"

import { INCLUDE_PROJECTION_UNTIL, PROJECTION_UNTIL_YEAR } from "../sim_3d/data/fossil_fuels/process_data_component"
import { EnergyFactorName } from "./interface"


const uk_budget_general = new IdOnly(1239)
const uk_budget_mackay_2009 = new IdOnly(1252)

// Will be fetched, and will recursively fetch all their dependencies.
export const top_ids_to_fetch = [
    uk_budget_general,
    uk_budget_mackay_2009,
]

const cars_uk = new IdOnly(1205)
const planes_uk = new IdOnly(1209)
const heating_cooling_uk = new IdOnly(1220)
const lighting_uk = new IdOnly(1227)
const gadgets_uk = new IdOnly(1228)
const food_and_farming_uk = new IdOnly(1229)
const producing_stuff_uk = new IdOnly(1230)
const transporting_stuff_uk = new IdOnly(1231)
const public_services_uk = new IdOnly(1232)

const onshore_wind = new IdOnly(1206)
const solar_heating_potential_per_person_UK = new IdOnly(1191)
const solar_residential_pv_potential_per_person_UK = new IdOnly(1202)
const solar_farm_pv_potential_per_person_UK = new IdOnly(1204)
const biofuel_potential_per_person_UK = new IdOnly(1210)
const hydro_UK = new IdOnly(1221)
const shallow_offshore_wind_UK = new IdOnly(1222)
const deep_offshore_wind_UK = new IdOnly(1223)
const wave_UK = new IdOnly(1224)
const tide_UK = new IdOnly(1225)
const geothermal_UK = new IdOnly(1226)

export const map_factor_name_to_ido: Record<EnergyFactorName, IdOnly | undefined> = {
    "Car": cars_uk,
    "Jet flights": planes_uk,
    "Heating, cooling": heating_cooling_uk,
    "Light": lighting_uk,
    "Gadgets": gadgets_uk,
    "Food, farming, fertiliser": food_and_farming_uk,
    "Stuff": producing_stuff_uk,
    "Transporting stuff": transporting_stuff_uk,
    "Defence": public_services_uk,

    "Onshore wind": onshore_wind,
    "Solar heating": solar_heating_potential_per_person_UK,
    "PV residential": solar_residential_pv_potential_per_person_UK,
    "PV farm": solar_farm_pv_potential_per_person_UK,
    "Biomass: food, biofuel, wood, waste incineration, landfill gas": biofuel_potential_per_person_UK,
    "Hydroelectricity": hydro_UK,
    "Shallow offshore wind": shallow_offshore_wind_UK,
    "Deep offshore wind": deep_offshore_wind_UK,
    "Wave": wave_UK,
    "Tide": tide_UK,
    "Geothermal": geothermal_UK,
}


export const population_id = "1011v12" // UK population
export const oil_gas_id = "1284v19" // UK oil and gas production, reserves and resources
export const solar_farms_id = "1295v3" // UK solar farms by year
export const wind_farms_id = "1297v3" // UK wind farms by year with estimated area

// This is not necessary but it slightly increases the initial loading speed of
// the application.  It has been manually created by copying and pasting the
// "Fetching N dependencies... 1191v7, " ... etc. log from the console.
export const other_ids_performance_boost: IdsToFetchAndMaybeCompute[] = [
    // UK population
    { id: "1011v7" }, // repeated
    { id: "1011v10" }, // repeated
    { id: population_id, compute_value: true, args_for_compute: `undefined,"United Kingdom"` },
    { id: "1132v4" },
    { id: "1145v1" },
    { id: "1154v1" },
    { id: "1157v3" },
    { id: "1181v1" },
    { id: "1183v1" }, // repeated
    { id: "1183v2" }, // repeated
    { id: "1183v3" }, // repeated
    { id: "1183v4" }, // repeated
    { id: "1183v5" },
    { id: "1184v5" }, // repeated
    { id: "1184v11" }, // repeated
    { id: "1184v12" }, // repeated
    { id: "1184v15" },
    { id: "1186v2" }, // repeated
    { id: "1186v4" },
    { id: "1187v1" }, // repeated
    { id: "1187v3" },
    { id: "1188v3" },
    { id: "1189v2" },
    { id: "1190v1" },
    { id: "1191v8" },
    { id: "1192v4" },
    { id: "1193v1" },
    { id: "1194v1" },
    { id: "1200v1" },
    { id: "1201v2" },
    { id: "1202v10" },
    { id: "1203v2" },
    { id: "1204v4" },
    { id: "1205v5" },
    { id: "1206v5" },
    { id: "1208v1" },
    { id: "1209v7" },
    { id: "1210v6" },
    { id: "1220v10" },
    { id: "1221v4" },
    { id: "1222v7" }, // repeated
    { id: "1222v10" },
    { id: "1223v9" },
    { id: "1224v4" },
    { id: "1225v3" },
    { id: "1226v3" },
    { id: "1227v4" },
    { id: "1228v4" },
    { id: "1229v4" },
    { id: "1230v5" },
    { id: "1231v4" },
    { id: "1232v3" },
    { id: "1237v1" },
    { id: "1238v6" }, // repeated
    { id: "1238v10" },
    { id: "1244v5" },
    { id: "1245v4" },
    { id: "1246v4" },
    { id: "1248v4" },
    { id: "1251v3" },
    { id: "1253v1" },
    { id: "1254v2" },
    { id: "1255v2" },
    { id: "1257v1" },
    { id: "1258v2" }, // repeated
    { id: "1258v5" },
    { id: "1275v1" },
    { id: "1276v1" },
    { id: "1277v1" },
    { id: "1279v4" },
    { id: "1280v4" }, // repeated
    { id: "1280v13" },
    // UK Oil and gas reserves and production
    { id: oil_gas_id, compute_value: true, args_for_compute: `true,${INCLUDE_PROJECTION_UNTIL ? PROJECTION_UNTIL_YEAR : undefined}` },
    { id: "1285v4" },
    { id: "1286v7" },
    // UK Solar Farms
    { id: solar_farms_id, compute_value: true, args_for_compute: `` },
    { id: "1296v3" },
    // UK Wind Farms (with estimated area)
    { id: wind_farms_id, compute_value: true, args_for_compute: `` },
].map(({ id, compute_value, args_for_compute }) =>
{
    if (!compute_value)
    {
        return {
            id: parse_id(id),
            compute_value: false,
        }
    }
    return {
        id: parse_id(id),
        compute_value,
        args_for_compute,
    }
})


export type IdsToFetchAndMaybeCompute = {
    id: IdAndMaybeVersion
    compute_value: false
    args_for_compute?: never
} | {
    id: IdAndMaybeVersion
    compute_value: true
    args_for_compute: string
}


export const all_ids_to_fetch: IdsToFetchAndMaybeCompute[] = [
    ...top_ids_to_fetch.map(id => ({ id, compute_value: true, args_for_compute: "" } as IdsToFetchAndMaybeCompute)),
    ...other_ids_performance_boost,
]
