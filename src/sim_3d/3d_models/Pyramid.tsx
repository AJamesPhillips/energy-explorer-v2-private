import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial"
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2"
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry"


export interface PyramidProps
{
    cell_size: number
    base_width: number
    height: number
    inverted?: boolean
    point_offset?: THREE.Vector2
    position?: THREE.Vector3
    // A value between 0 and 3 of the base point to use to add two additional
    // struts from the base to the midpoint of the line going between the apex
    // a neighbouring base point
    extra_strut_indices?: number[]
    extra_strut_position?: number
}

export function Pyramid(props: PyramidProps)
{
    const vertices = useMemo(() =>
    {
        const half_base = props.base_width / 2
        const base_points = [
            new THREE.Vector3(-half_base, 0, -half_base),
            new THREE.Vector3( half_base, 0, -half_base),
            new THREE.Vector3( half_base, 0,  half_base),
            new THREE.Vector3(-half_base, 0,  half_base),
        ]
        const apex_point = new THREE.Vector3(0, 0, 0)
        apex_point.y = props.inverted ? -props.height : props.height
        apex_point.x = props.point_offset ? props.point_offset.x : 0
        apex_point.z = props.point_offset ? props.point_offset.y : 0

        const vertices: number[] = []
        base_points.forEach((base_point, index) =>
        {
            // Line from base point to top point
            vertices.push(base_point.x, base_point.y, base_point.z)
            vertices.push(apex_point.x, apex_point.y, apex_point.z)

            // Line from base point to next base point (wrap around at the end)
            const next_base_point = base_points[(index + 1) % base_points.length]!
            vertices.push(base_point.x, base_point.y, base_point.z)
            vertices.push(next_base_point.x, next_base_point.y, next_base_point.z)
        })
        // Diagonal lines across the base
        const base_0 = base_points[0]!
        const base_1 = base_points[1]!
        const base_2 = base_points[2]!
        const base_3 = base_points[3]!
        vertices.push(base_0.x, base_0.y, base_0.z)
        vertices.push(base_2.x, base_2.y, base_2.z)
        vertices.push(base_1.x, base_1.y, base_1.z)
        vertices.push(base_3.x, base_3.y, base_3.z)

        props.extra_strut_indices?.forEach(extra_strut_index =>
        {
            const base_point = base_points[extra_strut_index]!
            const extra_strut_position = props.extra_strut_position ?? 0.5

            base_points.forEach((other_base_point, index) =>
            {
                if (index === extra_strut_index) return

                const attach_point = apex_point.clone().sub(other_base_point).multiplyScalar(extra_strut_position).add(other_base_point)
                vertices.push(base_point.x, base_point.y, base_point.z)
                vertices.push(attach_point.x, attach_point.y, attach_point.z)
            })
        })

        return vertices
    }, [])

    return <WireFrame2
        cell_size={props.cell_size}
        vertices={vertices}
        position={props.position}
        color={0x444444}
    />
}


export interface LinesWireFrameProps
{
    cell_size: number
    vertices: number[]
    close_loop?: boolean
    position?: THREE.Vector3
    color?: number
}
export function LinesWireFrame(props: LinesWireFrameProps)
{
    const { close_loop = true } = props

    const vertices = useMemo(() =>
    {
        // Convert triangle vertices to line segments (each edge becomes a line segment)
        const line_vertices: number[] = []
        for (let i = 0; i < props.vertices.length; i += 3)
        {
            const v1 = props.vertices.slice(i, i + 3)
            let v_next = props.vertices.slice(i + 3, i + 6)
            if (i >= props.vertices.length - 3)
            {
                if (!close_loop) break
                v_next = props.vertices.slice(0, 3)
            }

            // Edge from v1 to v_next
            line_vertices.push(...v1, ...v_next)
        }
        return line_vertices
    }, [props.vertices, close_loop])

    return <WireFrame2 {...props} vertices={vertices} />
}


interface WireFrameProps
{
    vertices: number[]
    position?: THREE.Vector3
    color?: number
}
function WireFrame({ vertices, position, color = 0x444444 }: WireFrameProps)
{
    const wire_mat = useMemo(() => {
        const m = new LineMaterial({
            color,
            linewidth: 2, // in pixels when resolution is set
        })
        m.resolution.set(window.innerWidth, window.innerHeight)
        return m
    }, [color])

    const wireframe = useMemo(() => new LineSegments2(new LineSegmentsGeometry().setPositions(vertices), wire_mat), [vertices, wire_mat])

    useEffect(() => () =>
    {
        wire_mat.dispose()
        wireframe.geometry.dispose()
        wireframe.material.dispose()
    }, [wire_mat, wireframe])

    return <primitive object={wireframe} position={position} />
}


interface WireFrame2Props
{
    cell_size: number
    vertices: number[]
    position?: THREE.Vector3
    color?: number
}
function WireFrame2({ cell_size, vertices, position, color = 0x444444 }: WireFrame2Props)
{
    const mat = useMemo(() => new THREE.MeshBasicMaterial({ color }), [color])

    const tube_geos = useMemo(() =>
    {
        const geos: THREE.BufferGeometry[] = []
        for (let i = 0; i < vertices.length; i += 6)
        {
            const v1 = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
            const v2 = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5])

            const curve = new THREE.LineCurve3(v1, v2)
            geos.push(new THREE.TubeGeometry(curve, 1, cell_size * 0.006, 6, false))
        }
        return geos
    }, [vertices, cell_size])

    useEffect(() => () =>
    {
        mat.dispose()
        tube_geos.forEach(g => g.dispose())
    }, [mat, tube_geos])

    return <>
        {tube_geos.map(tube_geo => <mesh geometry={tube_geo} position={position} material={mat} />)}
    </>
}
