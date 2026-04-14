import * as THREE from 'three';
import type { MeshClassification } from './meshClassifier';
import type { Wrap } from '../types';

export function createWrapMaterial(wrap: Wrap): THREE.MeshPhysicalMaterial {
  const color = new THREE.Color(wrap.hex);
  const isMetallic = wrap.metalness > 0.5;
  const isMatte = wrap.roughness > 0.6;
  const isGloss = wrap.roughness < 0.1;

  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: wrap.roughness,
    metalness: wrap.metalness,
    clearcoat: wrap.clearcoat ?? (isMetallic ? 1.0 : isMatte ? 0.2 : 0.7),
    clearcoatRoughness: wrap.clearcoatRoughness ?? (isMatte ? 0.3 : 0.04),
    envMapIntensity: wrap.envMapIntensity ?? (isMetallic ? 2.4 : isGloss ? 1.8 : 1.2),
    iridescence: wrap.iridescence ?? 0,
    iridescenceIOR: wrap.iridescenceIOR ?? 1.3,
    reflectivity: wrap.reflectivity ?? (isMetallic ? 1.0 : 0.6),
    specularIntensity: isMetallic ? 1.0 : 0.5,
    specularColor: new THREE.Color('#ffffff'),
    thickness: isGloss ? 0.45 : 0.28,
    ior: isMetallic ? 1.7 : 1.52,
    sheen: isMatte ? 0.4 : 0,
    sheenRoughness: 0.8,
    sheenColor: color,
  });
}

function createGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0a0a0a'),
    roughness: 0.0,
    metalness: 0.0,
    transmission: 0.92,
    transparent: true,
    opacity: 0.4,
    thickness: 0.4,
    ior: 1.52,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    specularIntensity: 1.0,
    specularColor: new THREE.Color('#ffffff'),
    attenuationColor: new THREE.Color('#101010'),
    attenuationDistance: 0.5,
  });
}

function createTireMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#080808'),
    roughness: 0.92,
    metalness: 0.0,
    envMapIntensity: 0.05,
  });
}

function createRimMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#c0c0c0'),
    roughness: 0.08,
    metalness: 1.0,
    envMapIntensity: 3.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    ior: 1.75,
    thickness: 0.1,
    reflectivity: 1.0,
    specularIntensity: 1.0,
    specularColor: new THREE.Color('#ffffff'),
  });
}

function createLightMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.0,
    transmission: 0.9,
    transparent: true,
    opacity: 0.85,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.5,
    thickness: 0.2,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    specularIntensity: 1.0,
  });
}

function createExhaustMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#999999'),
    roughness: 0.1,
    metalness: 1.0,
    envMapIntensity: 2.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    specularIntensity: 1.0,
  });
}

function createInteriorMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#151515'),
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.1,
  });
}

export function createTintMaterial(matSettings: {
  opacity: number;
  color: string;
  roughness: number;
  metalness: number;
}): THREE.MeshPhysicalMaterial {
  // Map opacity (0.1–0.85) to glass-like transmission (1.0 → 0.1)
  const transmission = Math.max(0.05, 1.0 - matSettings.opacity);
  const isNoTint = matSettings.opacity <= 0.12;

  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(isNoTint ? '#87CEEB' : matSettings.color),
    roughness: 0.0,
    metalness: 0.0,
    transmission,
    transparent: true,
    opacity: isNoTint ? 0.85 : 0.95,
    thickness: 0.3,
    ior: 1.52,
    envMapIntensity: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    specularIntensity: 0.8,
    specularColor: new THREE.Color('#ffffff'),
    attenuationColor: new THREE.Color(isNoTint ? '#aaccff' : matSettings.color),
    attenuationDistance: isNoTint ? 2.0 : 0.6,
  });
}

export function createRimMaterialForWheel(wheelOption: {
  finish: string;
  transform?: {
    scale: number;
    profile: number;
  };
  material?: {
    color: string;
    roughness: number;
    metalness: number;
    envMapIntensity: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
  };
}): THREE.MeshPhysicalMaterial {
  if (wheelOption.material) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(wheelOption.material.color),
      roughness: wheelOption.material.roughness,
      metalness: wheelOption.material.metalness,
      envMapIntensity: wheelOption.material.envMapIntensity,
      clearcoat: wheelOption.material.clearcoat ?? 0.8,
      clearcoatRoughness: wheelOption.material.clearcoatRoughness ?? 0.05,
      ior: 1.7,
      thickness: 0.1,
      reflectivity: 1.0,
      specularIntensity: 1.0,
      specularColor: new THREE.Color('#ffffff'),
    });
  }

  return createRimMaterial();
}

export function getPermanentMaterial(type: MeshClassification): THREE.Material | null {
  switch (type) {
    case 'glass': return createGlassMaterial();
    case 'tire': return createTireMaterial();
    case 'rim': return createRimMaterial();
    case 'light': return createLightMaterial();
    case 'exhaust': return createExhaustMaterial();
    case 'interior': return createInteriorMaterial();
    default: return null;
  }
}
