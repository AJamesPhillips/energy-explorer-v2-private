import * as THREE from "three"


export function compute_bounding_box(
    geometry: THREE.BufferGeometry,
    instance_count: number,
    mesh: THREE.InstancedMesh)
{
    if (!geometry.boundingSphere) geometry.computeBoundingSphere()
    const base_radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 0

    const tmp_matrix = new THREE.Matrix4()
    const tmp_pos = new THREE.Vector3()
    const tmp_quat = new THREE.Quaternion()
    const tmp_scale = new THREE.Vector3()

    let min_x = Infinity, min_y = Infinity, min_z = Infinity
    let max_x = -Infinity, max_y = -Infinity, max_z = -Infinity

    for (let i = 0; i < instance_count; ++i) {
        mesh.getMatrixAt(i, tmp_matrix)
        tmp_matrix.decompose(tmp_pos, tmp_quat, tmp_scale)
        const scaled_radius = base_radius * Math.max(tmp_scale.x, tmp_scale.y, tmp_scale.z)
        min_x = Math.min(min_x, tmp_pos.x - scaled_radius)
        min_y = Math.min(min_y, tmp_pos.y - scaled_radius)
        min_z = Math.min(min_z, tmp_pos.z - scaled_radius)
        max_x = Math.max(max_x, tmp_pos.x + scaled_radius)
        max_y = Math.max(max_y, tmp_pos.y + scaled_radius)
        max_z = Math.max(max_z, tmp_pos.z + scaled_radius)
    }

    const box = new THREE.Box3(new THREE.Vector3(min_x, min_y, min_z), new THREE.Vector3(max_x, max_y, max_z))
    mesh.geometry.boundingBox = box
    const center = box.getCenter(new THREE.Vector3())
    const radius = box.getSize(new THREE.Vector3()).length() / 2
    mesh.geometry.boundingSphere = new THREE.Sphere(center, radius)
}
