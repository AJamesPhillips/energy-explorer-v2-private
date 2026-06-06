import { GeometryCollection, Topology } from "topojson-specification"


export interface WorldAtlas extends Topology
{
    objects: {
        countries: GeometryCollection
        land: GeometryCollection
    }
}
