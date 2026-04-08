import * as THREE from 'three';

export type MeshClassification = 'body' | 'glass' | 'tire' | 'rim' | 'light' | 'exhaust' | 'interior';

const GLASS_NAMES = ['glass', 'window', 'windshield', 'wind', 'screen', 'visor', 'shield', 'crystal', 'lens', 'light_glass'];
const TIRE_NAMES = ['tire', 'tyre', 'rubber', 'wheel_rubber', 'tread'];
const RIM_NAMES = ['rim', 'wheel', 'spoke', 'hub', 'brake', 'caliper', 'disc', 'rotor', 'alloy'];
const LIGHT_NAMES = ['light', 'lamp', 'headlight', 'taillight', 'indicator', 'blinker', 'led'];
const EXHAUST_NAMES = ['exhaust', 'pipe', 'muffler', 'tip'];
const INTERIOR_NAMES = ['interior', 'seat', 'dash', 'steering', 'cockpit', 'cabin', 'floor', 'carpet'];

function nameContainsAny(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function classifyByName(meshName: string, matName: string): MeshClassification | null {
  const combined = meshName + ' ' + matName;

  if (nameContainsAny(combined, GLASS_NAMES)) return 'glass';
  if (nameContainsAny(combined, TIRE_NAMES)) return 'tire';
  if (nameContainsAny(combined, RIM_NAMES)) return 'rim';
  if (nameContainsAny(combined, LIGHT_NAMES)) return 'light';
  if (nameContainsAny(combined, EXHAUST_NAMES)) return 'exhaust';
  if (nameContainsAny(combined, INTERIOR_NAMES)) return 'interior';

  return null;
}

function classifyByMaterial(mat: THREE.Material): MeshClassification | null {
  const std = mat as THREE.MeshStandardMaterial;
  if (!std.color) return null;

  const r = std.color.r;
  const g = std.color.g;
  const b = std.color.b;
  const roughness = std.roughness ?? 0.5;
  const metalness = std.metalness ?? 0;

  if (
    (mat instanceof THREE.MeshPhysicalMaterial && (mat as THREE.MeshPhysicalMaterial).transmission > 0.1) ||
    (mat.transparent && mat.opacity < 0.9) ||
    (r > 0.7 && g > 0.7 && b > 0.7 && mat.transparent)
  ) {
    return 'glass';
  }

  if (roughness > 0.8 && metalness < 0.1 && r < 0.08 && g < 0.08 && b < 0.08) {
    return 'tire';
  }

  if (metalness > 0.5 && roughness < 0.5) {
    return 'rim';
  }

  return null;
}

export function classifyMesh(mesh: THREE.Mesh): MeshClassification {
  const meshName = mesh.name || '';
  const mat = mesh.material as THREE.MeshStandardMaterial;
  const matName = mat?.name || '';

  const nameResult = classifyByName(meshName, matName);
  if (nameResult) return nameResult;

  if (mat) {
    const matResult = classifyByMaterial(mat);
    if (matResult) return matResult;
  }

  return 'body';
}

export function scanAndClassify(
  scene: THREE.Object3D,
  _carLabel?: string
): Map<THREE.Mesh, MeshClassification> {
  const result = new Map<THREE.Mesh, MeshClassification>();

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const classification = classifyMesh(child);
    result.set(child, classification);
  });

  return result;
}
