import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, useProgress, Lightformer, AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Wrap, TintOption } from '../types';
import { scanAndClassify, type MeshClassification } from '../lib/meshClassifier';
import { createWrapMaterial, getPermanentMaterial, createTintMaterial, createRimMaterialForWheel } from '../lib/carMaterials';
import { WHEEL_OPTIONS } from '../data/wheelOptions';

function getWrapKey(wrap: Wrap): string {
  return [
    wrap.brand,
    wrap.name,
    wrap.hex,
    wrap.roughness,
    wrap.metalness,
    wrap.clearcoat ?? '',
    wrap.clearcoatRoughness ?? '',
    wrap.iridescence ?? '',
    wrap.iridescenceIOR ?? '',
    wrap.reflectivity ?? '',
    wrap.materialType,
  ].join('|');
}

function shouldTreatGlassAsBody(mesh: THREE.Mesh): boolean {
  const meshName = (mesh.name ?? '').toLowerCase();
  const mat = mesh.material as THREE.Material | undefined;
  const matName = (mat?.name ?? '').toLowerCase();
  const combined = `${meshName} ${matName}`;

  // Some car files name painted roof panels with "glass"/"window" terms.
  // Keep windshield/side/rear windows as tintable glass, but force roof panels to wrap.
  const roofLike = /roof|sunroof|top|upper|body_sedan/.test(combined);
  const explicitWindow = /windshield|windscreen|window|doorglass|sideglass|side_glass|backlight|rearglass|rear_glass/.test(combined);
  return roofLike && !explicitWindow;
}

function FadeWrapper({ children, carFile }: { children: React.ReactNode; carFile: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const prevFile = useRef(carFile);
  const fadingMats = useRef<THREE.Material[]>([]);
  const fadeDone = useRef(true);
  const { invalidate } = useThree();

  useEffect(() => {
    if (prevFile.current !== carFile) {
      prevFile.current = carFile;
      fadingMats.current = [];
      fadeDone.current = false;
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.Material;
            mat.transparent = true;
            mat.opacity = 0;
            fadingMats.current.push(mat);
          }
        });
      }
      invalidate();
    }
  }, [carFile, invalidate]);

  useFrame((_, delta) => {
    if (fadeDone.current || fadingMats.current.length === 0) return;
    let allDone = true;
    for (const mat of fadingMats.current) {
      if (mat.opacity < 1) {
        mat.opacity = Math.min(mat.opacity + delta * 2.5, 1);
        if (mat.opacity >= 0.99) {
          mat.opacity = 1;
          const phys = mat as THREE.MeshPhysicalMaterial;
          const isNaturallyTransparent = phys.transmission > 0 || (phys.emissiveIntensity ?? 0) > 0;
          if (!isNaturallyTransparent && !mat.userData.keepTransparent) {
            mat.transparent = false;
          }
        } else {
          allDone = false;
        }
      }
    }
    if (allDone) {
      fadeDone.current = true;
      fadingMats.current = [];
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function CarModel({ wrap, carFile, suspensionHeight, tint, wheelIndex, onLoaded }: {
  wrap: Wrap;
  carFile: string;
  suspensionHeight: number;
  tint: TintOption;
  wheelIndex: number;
  onLoaded: () => void;
}) {
  const { scene } = useGLTF(carFile, undefined, undefined, (loader) => {
    const gltfLoader = loader as unknown as { setKTX2Loader: (ktx2: KTX2Loader) => void; manager: THREE.LoadingManager };
    const renderer = (window as unknown as { __R3F_GL__?: THREE.WebGLRenderer }).__R3F_GL__;
    if (!renderer) return;
    const ktx2 = new KTX2Loader(gltfLoader.manager)
      .setTranscoderPath('https://unpkg.com/three@0.165.0/examples/jsm/libs/basis/')
      .detectSupport(renderer);
    gltfLoader.setKTX2Loader(ktx2);
  });
  const classified = useRef<Map<THREE.Mesh, MeshClassification>>(new Map());
  const lastClassifiedFile = useRef('');
  const permanentApplied = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const currentYOffset = useRef(0);
  const glassMaterials = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const rimMeshes = useRef<THREE.Mesh[]>([]);
  const rimBaseScale = useRef<Map<THREE.Mesh, THREE.Vector3>>(new Map());
  const rimBaseGeometry = useRef<Map<THREE.Mesh, THREE.BufferGeometry>>(new Map());
  const bodyMeshes = useRef<THREE.Mesh[]>([]);
  const suspensionRange = useRef(0.14);
  const targetTintTransmission = useRef(Math.max(0.05, 1.0 - tint.material.opacity));
  const targetTintColor = useRef(new THREE.Color(tint.material.opacity <= 0.12 ? '#87CEEB' : tint.material.color));
  // Cached shared materials — one instance per wrap/rim/tint key, cloned only per-mesh
  const wrapMatCache = useRef<{ key: string; mat: THREE.MeshPhysicalMaterial } | null>(null);
  const rimMatCache = useRef<{ key: number; mat: THREE.MeshPhysicalMaterial } | null>(null);
  const tintAnimating = useRef(false);
  const suspAnimating = useRef(false);
  const { invalidate, camera } = useThree();
  const lodBuckets = useRef<{ mesh: THREE.Mesh; maxDist: number }[]>([]);

  if (lastClassifiedFile.current !== carFile) {
    lastClassifiedFile.current = carFile;
    permanentApplied.current = false;
    currentYOffset.current = 0;
    glassMaterials.current = [];
    rimMeshes.current = [];
    rimBaseScale.current.clear();
    rimBaseGeometry.current.clear();
    bodyMeshes.current = [];
    suspensionRange.current = 0.14;
    wrapMatCache.current = null;
    rimMatCache.current = null;
    lodBuckets.current = [];
    classified.current = scanAndClassify(scene);
  }

  useEffect(() => {
    targetTintTransmission.current = Math.max(0.05, 1.0 - tint.material.opacity);
    const isNoTint = tint.material.opacity <= 0.12;
    targetTintColor.current = new THREE.Color(isNoTint ? '#87CEEB' : tint.material.color);
    tintAnimating.current = true;
    invalidate();
  }, [tint, invalidate]);

  // Full scene setup whenever car file changes — runs once per model load
  useEffect(() => {
    // Step 1: classify and apply permanent materials
    const rims: THREE.Mesh[] = [];
    const bodies: THREE.Mesh[] = [];
    classified.current.forEach((type, mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = true;

      if (type === 'body') { bodies.push(mesh); return; }
      if (type === 'glass') {
        if (shouldTreatGlassAsBody(mesh)) bodies.push(mesh);
        return;
      }
      if (type === 'rim') { rims.push(mesh); return; }
      const mat = getPermanentMaterial(type);
      if (mat) {
        if (mat.transparent) mat.userData.keepTransparent = true;
        mesh.material = mat;
      }
    });
    rimMeshes.current = rims;
    bodyMeshes.current = bodies;
    rims.forEach((mesh) => {
      rimBaseScale.current.set(mesh, mesh.scale.clone());
      const baseGeometry = mesh.geometry.clone();
      baseGeometry.computeVertexNormals();
      rimBaseGeometry.current.set(mesh, baseGeometry);
      mesh.geometry = baseGeometry.clone();
    });

    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    const carScale = Math.max(size.x, size.y, size.z);
    const smallPartDist = carScale * 2.0;
    const tinyPartDist = carScale * 1.4;
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!child.geometry.boundingSphere) child.geometry.computeBoundingSphere();
      const radius = child.geometry.boundingSphere?.radius ?? 0;
      if (radius < 0.03) lodBuckets.current.push({ mesh: child, maxDist: tinyPartDist });
      else if (radius < 0.06) lodBuckets.current.push({ mesh: child, maxDist: smallPartDist });
    });
    suspensionRange.current = Math.max(0.1, Math.min(0.2, size.y * 0.22));
    permanentApplied.current = true;

    // Step 2: apply current wrap
    wrapMatCache.current = null;
    const wrapMat = createWrapMaterial(wrap);
    wrapMatCache.current = { key: getWrapKey(wrap), mat: wrapMat };
    bodies.forEach((mesh) => {
      mesh.material = wrapMat.clone();
    });

    // Step 3: apply current rims
    rimMatCache.current = null;
    const rimMat = createRimMaterialForWheel(WHEEL_OPTIONS[wheelIndex]);
    rimMatCache.current = { key: wheelIndex, mat: rimMat };
    rims.forEach((mesh) => {
      mesh.material = rimMat.clone();
    });

    // Step 4: apply current tint
    const tintMat = createTintMaterial(tint.material);
    tintMat.userData.keepTransparent = true;
    const glassMats: THREE.MeshPhysicalMaterial[] = [];
    classified.current.forEach((type, mesh) => {
      if (type === 'glass' && !shouldTreatGlassAsBody(mesh)) {
        const cloned = tintMat.clone();
        cloned.userData.keepTransparent = true;
        mesh.material = cloned;
        glassMats.push(cloned);
      }
    });
    tintMat.dispose();
    glassMaterials.current = glassMats;
    tintAnimating.current = false;

    onLoaded();
    invalidate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carFile]);

  // Apply wrap material whenever wrap changes (not on initial car load)
  useEffect(() => {
    if (!permanentApplied.current || bodyMeshes.current.length === 0) return;
    const wrapKey = getWrapKey(wrap);
    if (wrapMatCache.current?.key === wrapKey) return;
    wrapMatCache.current?.mat.dispose();
    const wrapMat = createWrapMaterial(wrap);
    wrapMatCache.current = { key: wrapKey, mat: wrapMat };
    bodyMeshes.current.forEach((mesh) => {
      (mesh.material as THREE.Material).dispose?.();
      mesh.material = wrapMat.clone();
    });
    invalidate();
  }, [wrap, invalidate]);

  // Apply rim material whenever wheelIndex changes
  useEffect(() => {
    if (!permanentApplied.current || rimMeshes.current.length === 0) return;
    const clampedWheelIndex = Math.max(0, Math.min(wheelIndex, WHEEL_OPTIONS.length - 1));
    if (rimMatCache.current?.key === clampedWheelIndex) return;

    rimMatCache.current?.mat.dispose();
    const wheelOption = WHEEL_OPTIONS[clampedWheelIndex];
    const rimMat = createRimMaterialForWheel(wheelOption);
    rimMatCache.current = { key: clampedWheelIndex, mat: rimMat };

    rimMeshes.current.forEach((mesh) => {
      (mesh.material as THREE.Material).dispose?.();
      const baseScale = rimBaseScale.current.get(mesh);
      if (baseScale) {
        const scale = wheelOption.transform?.scale ?? 1;
        mesh.scale.set(baseScale.x * scale, baseScale.y * scale, baseScale.z * scale);
      }

      const baseGeometry = rimBaseGeometry.current.get(mesh);
      if (baseGeometry) {
        const profile = wheelOption.transform?.profile ?? 1;
        const geom = baseGeometry.clone();
        geom.scale(1, profile, 1);
        geom.computeVertexNormals();
        mesh.geometry.dispose();
        mesh.geometry = geom;
      }

      mesh.material = rimMat.clone();
    });
    invalidate();
  }, [wheelIndex, invalidate]);

  // Apply tint material whenever tint changes
  useEffect(() => {
    if (!permanentApplied.current) return;
    const tintMat = createTintMaterial(tint.material);
    tintMat.userData.keepTransparent = true;
    const mats: THREE.MeshPhysicalMaterial[] = [];
    classified.current.forEach((type, mesh) => {
      if (type === 'glass' && !shouldTreatGlassAsBody(mesh)) {
        (mesh.material as THREE.Material).dispose?.();
        const cloned = tintMat.clone();
        cloned.userData.keepTransparent = true;
        mesh.material = cloned;
        mats.push(cloned);
      }
    });
    tintMat.dispose();
    glassMaterials.current = mats;
    tintAnimating.current = false;
    invalidate();
  }, [tint, invalidate]);

  useEffect(() => {
    suspAnimating.current = true;
    invalidate();
  }, [suspensionHeight, invalidate]);

  useFrame((_, delta) => {
    let needsFrame = false;

    if (suspAnimating.current && groupRef.current) {
      const target = suspensionHeight * suspensionRange.current;
      const diff = target - currentYOffset.current;
      if (Math.abs(diff) > 0.0001) {
        const response = 1 - Math.exp(-12 * delta);
        currentYOffset.current += diff * response;
        groupRef.current.position.y = currentYOffset.current;
        needsFrame = true;
      } else {
        currentYOffset.current = target;
        groupRef.current.position.y = target;
        suspAnimating.current = false;
      }
    }

    if (tintAnimating.current) {
      const lerpSpeed = 1 - Math.exp(-8 * delta);
      let tintDone = true;
      for (const mat of glassMaterials.current) {
        const tDiff = targetTintTransmission.current - mat.transmission;
        if (Math.abs(tDiff) > 0.001) {
          mat.transmission += tDiff * lerpSpeed;
          tintDone = false;
        } else {
          mat.transmission = targetTintTransmission.current;
        }
        mat.color.lerp(targetTintColor.current, lerpSpeed);
        mat.attenuationColor.lerp(targetTintColor.current, lerpSpeed);
        if (!mat.color.equals(targetTintColor.current)) tintDone = false;
      }
      if (tintDone) tintAnimating.current = false;
      else needsFrame = true;
    }

    for (const item of lodBuckets.current) {
      const dist = camera.position.distanceTo(item.mesh.getWorldPosition(new THREE.Vector3()));
      const shouldShow = dist <= item.maxDist;
      if (item.mesh.visible !== shouldShow) {
        item.mesh.visible = shouldShow;
        needsFrame = true;
      }
    }

    if (needsFrame) invalidate();
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#050508"
        roughness={0.4}
        metalness={0.6}
        envMapIntensity={0.3}
      />
    </mesh>
  );
}

function GroundReflection() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
      <circleGeometry args={[7, 80]} />
      <meshPhysicalMaterial
        color="#060810"
        roughness={0.08}
        metalness={0.9}
        envMapIntensity={1.8}
        transparent
        opacity={0.75}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        reflectivity={1.0}
      />
    </mesh>
  );
}

function SceneSetup() {
  const { gl } = useThree();
  useEffect(() => {
    THREE.ColorManagement.enabled = true;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.physicallyCorrectLights = true;
  }, [gl]);
  return null;
}

function StudioEnvironment({ isMobile }: { isMobile?: boolean }) {
  return (
    <>
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr"
        background={false}
        resolution={isMobile ? 256 : 512}
        frames={1}
      />
      <Environment frames={1} resolution={isMobile ? 256 : 512} background={false}>
        <Lightformer intensity={3.5} position={[0, 6, 0]} scale={[12, 2, 2]} />
        <Lightformer intensity={2.2} position={[5, 2.5, 3]} rotation={[0, -Math.PI / 4, 0]} scale={[3, 1, 1]} />
        <Lightformer intensity={1.8} position={[-5, 2.5, -3]} rotation={[0, Math.PI / 4, 0]} scale={[3, 1, 1]} />
        <Lightformer intensity={1.2} position={[0, 1.3, -8]} rotation={[0, Math.PI, 0]} scale={[8, 2, 1]} />
      </Environment>
    </>
  );
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(5, 2.2, 5.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.4, 0);

function CameraControls({ isMobile, controlsRef }: {
  isMobile?: boolean;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const lastTap = useRef(0);
  const { invalidate } = useThree();

  useEffect(() => {
    const canvas = controlsRef.current?.domElement;
    if (!canvas || !isMobile) return;

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return;
      const now = Date.now();
      if (now - lastTap.current < 300) {
        resetCamera();
      }
      lastTap.current = now;
    };

    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => canvas.removeEventListener('touchend', handleTouchEnd);
  });

  const resetCamera = () => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    controls.target.copy(DEFAULT_TARGET);
    controls.object.position.copy(DEFAULT_CAMERA_POS);
    controls.update();
    invalidate();
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enablePan={false}
      minDistance={3}
      maxDistance={14}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI / 2 - 0.08}
      enableDamping
      dampingFactor={0.04}
      rotateSpeed={isMobile ? 0.5 : 0.7}
      zoomSpeed={0.8}
      target={DEFAULT_TARGET}
      makeDefault
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      onChange={() => invalidate()}
    />
  );
}

function PostEffects({ isMobile }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <EffectComposer multisampling={0}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={2}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <N8AO
        aoRadius={0.4}
        intensity={1.2}
        distanceFalloff={0.5}
        halfRes
        screenSpaceRadius
      />
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}

function LoadingOverlay({ isMobile }: { isMobile?: boolean }) {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);
  const displayProgress = useRef(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active && progress >= 100) {
      const timer = setTimeout(() => setShow(false), 600);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  useEffect(() => {
    const interval = setInterval(() => {
      displayProgress.current += (progress - displayProgress.current) * 0.12;
      if (Math.abs(progress - displayProgress.current) < 0.5) {
        displayProgress.current = progress;
      }
      setDisplayValue(Math.round(displayProgress.current));
    }, 30);
    return () => clearInterval(interval);
  }, [progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#080a10] rounded-2xl"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="#FF4500"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - displayValue / 100)}`}
                  className="transition-[stroke-dashoffset] duration-100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white/80 tabular-nums font-mono">
                  {displayValue}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-white/30 font-medium tracking-[0.2em] uppercase">
                Loading Model
              </span>
              {isMobile && (
                <div className="w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF4500]/80 to-[#FF4500] rounded-full"
                    style={{ width: `${displayValue}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CenterCanvasProps {
  selectedWrap: Wrap;
  carFile: string;
  carLabel: string;
  suspensionHeight: number;
  tint: TintOption;
  wheelIndex: number;
  isMobile?: boolean;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
}

export default function CenterCanvas({ selectedWrap, carFile, carLabel, suspensionHeight, tint, wheelIndex, isMobile, canvasRef }: CenterCanvasProps) {
  const [modelReady, setModelReady] = useState(false);
  const [showHint, setShowHint] = useState(!!isMobile);
  const prevFile = useRef(carFile);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    if (prevFile.current !== carFile) {
      prevFile.current = carFile;
      setModelReady(false);
    }
  }, [carFile]);

  useEffect(() => {
    if (isMobile && showHint) {
      const timer = setTimeout(() => setShowHint(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isMobile, showHint]);

  const handleLoaded = useCallback(() => {
    setModelReady(true);
  }, []);

  useEffect(() => {
    useGLTF.preload(carFile);
  }, [carFile]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full rounded-2xl bg-black/60 border border-white/[0.06] relative overflow-hidden ${
        isMobile ? 'h-[50vh]' : 'h-full'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none z-0" />

      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 z-20">
        <div className="w-2 h-2 rounded-full bg-[#FF4500]/60 animate-pulse" />
        <span className="text-[10px] text-white/30 font-medium tracking-wider uppercase">
          Live Preview
        </span>
      </div>

      <AnimatePresence>
        {isMobile && showHint && modelReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/[0.1]">
              <p className="text-[11px] text-white/50 text-center whitespace-nowrap">
                Pinch to zoom &middot; Drag to rotate &middot; Double-tap to reset
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Canvas
        camera={{
          position: [DEFAULT_CAMERA_POS.x, DEFAULT_CAMERA_POS.y, DEFAULT_CAMERA_POS.z],
          fov: isMobile ? 48 : 38,
          near: 0.1,
          far: 60,
        }}
        gl={{
          antialias: !isMobile,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        shadows
        dpr={isMobile ? [1, 1.2] : [1, 1.5]}
        frameloop="demand"
        className="absolute inset-0 z-10"
        onCreated={({ gl }) => {
          if (canvasRef) canvasRef.current = gl.domElement;
          (window as unknown as { __R3F_GL__?: THREE.WebGLRenderer }).__R3F_GL__ = gl;
        }}
      >
        <SceneSetup />
        <AdaptiveDpr pixelated />
        <color attach="background" args={['#080a10']} />
        <fog attach="fog" args={['#080a10', 18, 50]} />

        <ambientLight intensity={0.2} color="#d0d8f0" />

        {/* Key light — main shadow caster */}
        <spotLight
          position={[5, 10, 5]}
          intensity={150}
          angle={0.32}
          penumbra={0.85}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={isMobile ? 512 : 2048}
          shadow-mapSize-height={isMobile ? 512 : 2048}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
        />

        {/* Fill light — opposite side, cool tone */}
        <spotLight
          position={[-7, 8, -4]}
          intensity={60}
          angle={0.5}
          penumbra={1}
          color="#c8d8f8"
          castShadow={false}
        />

        {/* Rim light — behind the car, dramatic edge highlight */}
        <spotLight
          position={[0, 4, -9]}
          intensity={45}
          angle={0.55}
          penumbra={0.9}
          color="#e8eeff"
        />

        {/* Side accent light */}
        <spotLight
          position={[-9, 5, 2]}
          intensity={22}
          angle={0.7}
          penumbra={1}
          color="#d8e0e8"
        />

        {/* Ground-level color fill for depth */}
        <pointLight position={[-5, 0.4, 2]} color="#0a1530" intensity={3} distance={12} decay={2} />
        <pointLight position={[5, 0.4, -2]} color="#200a02" intensity={2} distance={12} decay={2} />

        <StudioEnvironment isMobile={isMobile} />

        <Suspense fallback={null}>
          <FadeWrapper carFile={carFile}>
            <CarModel
              wrap={selectedWrap}
              carFile={carFile}
              suspensionHeight={suspensionHeight}
              tint={tint}
              wheelIndex={wheelIndex}
              onLoaded={handleLoaded}
            />
          </FadeWrapper>

          <GroundPlane />
          <GroundReflection />
        </Suspense>

        <CameraControls isMobile={isMobile} controlsRef={controlsRef} />
        <PostEffects isMobile={isMobile} />
      </Canvas>

      <LoadingOverlay isMobile={isMobile} />

      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 border border-white/[0.06]">
          <div
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: selectedWrap.hex }}
          />
          <span className="text-[9px] sm:text-[10px] text-white/40 font-medium truncate max-w-[180px] sm:max-w-none">
            {carLabel} &mdash; {selectedWrap.brand} {selectedWrap.name}
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
        <span className="text-[10px] text-white/20 font-mono">WebGL</span>
      </div>
    </motion.div>
  );
}
