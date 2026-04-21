import * as THREE from 'three';

export type MeshClassification = 'body' | 'glass' | 'tire' | 'rim' | 'light' | 'exhaust' | 'interior';

// Glass keywords — includes single-s 'glas' (German/Dutch) so 'Scheibe', 'Fensterglas' etc. are caught.
const GLASS_NAMES = [
  'glass', 'glas', 'window', 'windshield', 'windscreen', 'wind', 'screen',
  'visor', 'shield', 'crystal', 'lens', 'light_glass', 'quarterglass',
  'door_glass', 'scheibe', 'fenster', 'vitre', 'vitro',
];
const TIRE_NAMES = ['tire', 'tyre', 'rubber', 'wheel_rubber', 'tread'];
const RIM_NAMES = ['rim', 'wheel', 'spoke', 'hub', 'brake', 'caliper', 'disc', 'rotor', 'alloy'];
const LIGHT_NAMES = ['light', 'lamp', 'headlight', 'taillight', 'indicator', 'blinker', 'led'];
const EXHAUST_NAMES = ['exhaust', 'pipe', 'muffler', 'tip'];
const INTERIOR_NAMES = [
  'interior', 'seat', 'dash', 'dashboard', 'steering', 'cockpit', 'cabin',
  'floor', 'carpet', 'console', 'upholstery', 'headrest', 'armrest',
  'liner', 'headliner', 'inner_trim', 'inner_panel', 'innerdoor',
];
// 'pillar' intentionally removed — B/C-pillar glass panels share this word and must reach
// material-based detection rather than being force-classified as body paint.
const BODY_PRIORITY_NAMES = [
  'roof', 'sunroof', 'hood', 'fender', 'bumper', 'trunk', 'tailgate',
  'body', 'quarterpanel', 'quarter_panel',
  'door', 'bonnet', 'spoiler', 'skirt', 'sill', 'apron', 'panel',
];
const WINDOW_EXCEPTIONS = [
  'windshield', 'windscreen', 'window', 'doorglass', 'door_glass',
  'sideglass', 'side_glass', 'backlight', 'rearglass', 'rear_glass',
  'front_glass', 'quarterglass', 'quarter_glass',
];

function nameContainsAny(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function classifyByName(meshName: string, matName: string): MeshClassification | null {
  const combined = `${meshName} ${matName}`.toLowerCase();

  // Glass/window keywords always win unless it is a panoramic/carbon roof panel.
  // 'glas' (single-s) catches German naming (Scheibe, Fensterglas, Türglas…).
  // This runs BEFORE body-priority so door/pillar glass meshes are never misclassified.
  if (nameContainsAny(combined, GLASS_NAMES)) {
    const isPanoramicRoof = /sunroof|panoram|carbon_roof|roof_glass/.test(combined);
    if (!isPanoramicRoof) return 'glass';
  }

  // Major painted body panels — 'pillar' is excluded (see note on BODY_PRIORITY_NAMES).
  const isBodyPriority = BODY_PRIORITY_NAMES.some((kw) => combined.includes(kw));
  const isExplicitWindow = WINDOW_EXCEPTIONS.some((kw) => combined.includes(kw));
  if (isBodyPriority && !isExplicitWindow) return 'body';

  // Asset-specific fallback: sedan roof section whose material name contains a glass alias.
  if (combined.includes('body_sedan') && combined.includes('quati_glass')) return 'body';

  if (nameContainsAny(combined, TIRE_NAMES)) return 'tire';
  if (nameContainsAny(combined, RIM_NAMES)) return 'rim';
  if (nameContainsAny(combined, LIGHT_NAMES)) return 'light';
  if (nameContainsAny(combined, EXHAUST_NAMES)) return 'exhaust';
  if (nameContainsAny(combined, INTERIOR_NAMES)) return 'interior';

  return null;
}

function isGlassMaterial(mat: THREE.Material): boolean {
  const std = mat as THREE.MeshStandardMaterial;
  if (!std.color) return false;

  const r = std.color.r;
  const g = std.color.g;
  const b = std.color.b;
  const roughness = std.roughness ?? 0.5;
  const metalness = std.metalness ?? 0;

  // Physical transmission (GLB glass with PBR)
  if (mat instanceof THREE.MeshPhysicalMaterial && (mat as THREE.MeshPhysicalMaterial).transmission > 0.05) return true;
  // Alpha transparency
  if (mat.transparent && mat.opacity < 0.75) return true;
  if (r > 0.6 && g > 0.6 && b > 0.6 && mat.transparent && mat.opacity < 0.85) return true;
  // Smooth + non-metallic = glass or clear plastic (not painted metal, not rubber)
  if (roughness < 0.25 && metalness < 0.12) return true;
  // Dark + smooth + non-metallic = tinted window glass stored as opaque in the GLB
  if (r < 0.12 && g < 0.12 && b < 0.12 && roughness < 0.45 && metalness < 0.12) return true;

  return false;
}

function classifyByMaterial(mat: THREE.Material): MeshClassification | null {
  const std = mat as THREE.MeshStandardMaterial;
  if (!std.color) return null;

  const roughness = std.roughness ?? 0.5;
  const metalness = std.metalness ?? 0;
  const r = std.color.r;
  const g = std.color.g;
  const b = std.color.b;

  if (isGlassMaterial(mat)) return 'glass';

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

  // Non-body name results are authoritative (glass/tire/rim/light/exhaust/interior).
  if (nameResult !== null && nameResult !== 'body') return nameResult;

  // Always run glass detection against the material — even a body-named mesh (e.g.
  // "door_panel_glass", "b_pillar_01") should become glass if its material says so.
  // This is the only reliable way to handle GLBs where the window mesh name contains
  // a body-priority keyword but the material is clearly glass-like.
  if (mat && isGlassMaterial(mat)) return 'glass';

  // For meshes that had no name match at all, run the full material classifier.
  if (nameResult === null && mat) {
    const matResult = classifyByMaterial(mat);
    if (matResult) return matResult;
  }

  return nameResult ?? 'body';
}

export function scanAndClassify(
  scene: THREE.Object3D
): Map<THREE.Mesh, MeshClassification> {
  const result = new Map<THREE.Mesh, MeshClassification>();

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const classification = classifyMesh(child);
    result.set(child, classification);
  });

  return result;
}
