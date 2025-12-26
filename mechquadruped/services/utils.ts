import * as THREE from 'three';

export interface BoneResult {
  pivot: THREE.Group;
  mesh: THREE.Mesh;
}

/**
 * Creates a bone visualization: A cylinder for the shaft and a sphere for the joint.
 * The system assumes X-Axis alignment for the length of the bone.
 */
export function createBone(length: number, radius: number = 0.04, color: number = 0xffffff): BoneResult {
  // 1. The Joint (Pivot visual)
  // A sphere at (0,0,0) to visualize the mechanical joint
  const jointGeom = new THREE.SphereGeometry(radius * 1.4, 16, 16);
  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x444444, // Dark grey joints
    metalness: 0.8,
    roughness: 0.2
  });
  const jointMesh = new THREE.Mesh(jointGeom, jointMat);

  // 2. The Bone Shaft
  // Cylinder length is 'length', centered at length/2 so it starts at 0
  const shaftGeom = new THREE.CylinderGeometry(radius, radius * 0.8, length, 12);
  const shaftMat = new THREE.MeshStandardMaterial({ 
    color,
    metalness: 0.3,
    roughness: 0.7
  });
  const shaftMesh = new THREE.Mesh(shaftGeom, shaftMat);

  // Align Cylinder to X-Axis (Default is Y)
  shaftMesh.rotation.z = -Math.PI / 2;
  shaftMesh.position.x = length / 2;

  // 3. Pivot Group
  // The pivot is the transform root. Rotating this rotates the joint and the shaft.
  const pivot = new THREE.Group();
  pivot.add(jointMesh);
  pivot.add(shaftMesh);

  return { pivot, mesh: shaftMesh };
}
