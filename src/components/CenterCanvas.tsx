import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import type { Wrap, TintOption } from '../types';
import { scanAndClassify, type MeshClassification } from '../lib/meshClassifier';
import { createWrapMaterial, getPermanentMaterial, createTintMaterial, createRimMaterialForWheel } from '../lib/carMaterials';
import { WHEEL_OPTIONS } from '../data/wheelOptions';

function FadeWrapper({ children, carFile }: { children: React.ReactNode; carFile: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const prevFile = useRef(carFile);

  useEffect(() => {
    if (prevFile.current !== carFile) {
      prevFile.current = carFile;
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.Material;
            mat.transparent = true;
            mat.opacity = 0;
          }
        });
      }
    }
  }, [carFile]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.Material;
        if (mat.opacity < 1) {
          mat.transparent = true;
          mat.opacity = Math.min(mat.opacity + delta * 2.5, 1);
          if (mat.opacity >= 0.99) {
            mat.opacity = 1;
            const phys = mat as THREE.MeshPhysicalMaterial;
            const isNaturallyTransparent = phys.transmission > 0 || phys.emissive;
            if (!isNaturallyTransparent && !mat.userData.keepTransparent) {
              mat.transparent = false;
            }
          }
        }
      }
    });
  });

  return <group ref={groupRef}>{children}</group>;
}

function CarModel({ wrap, carFile, carLabel, suspensionHeight, tint, wheelIndex, onLoaded }: {
  wrap: Wrap;
  carFile: string;
  carLabel: string;
  suspensionHeight: number;
  tint: TintOption;
  wheelIndex: number;
  onLoaded: () => void;
}) {
  const { scene } = useGLTF(carFile);
  const classified = useRef<Map<THREE.Mesh, MeshClassification>>(new Map());
  const lastClassifiedFile = useRef('');
  const permanentApplied = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const currentYOffset = useRef(0);
  const glassMaterials = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const rimMeshes = useRef<THREE.Mesh[]>([]);
  const targetTintOpacity = useRef(tint.material.opacity);
  const targetTintColor = useRef(new THREE.Color(tint.material.color));

  if (lastClassifiedFile.current !== carFile) {
    lastClassifiedFile.current = carFile;
    permanentApplied.current = false;
    currentYOffset.current = 0;
    glassMaterials.current = [];
    rimMeshes.current = [];
    classified.current = scanAndClassify(scene, carLabel);
  }

  useEffect(() => {
    targetTintOpacity.current = tint.material.opacity;
    targetTintColor.current = new THREE.Color(tint.material.color);
  }, [tint]);

  useEffect(() => {
    if (!permanentApplied.current) {
      permanentApplied.current = true;
      const rims: THREE.Mesh[] = [];
      classified.current.forEach((type, mesh) => {
        if (type === 'body' || type === 'glass') return;
        if (type === 'rim') {
          rims.push(mesh);
          return;
        }
        const mat = getPermanentMaterial(type);
        if (mat) {
          if (mat.transparent) {
            mat.userData.keepTransparent = true;
          }
          mesh.material = mat;
        }
      });
      rimMeshes.current = rims;
    }

    const wheelOption = WHEEL_OPTIONS[wheelIndex];
    const rimMat = createRimMaterialForWheel(wheelOption);
    rimMeshes.current.forEach((mesh) => {
      mesh.material = rimMat.clone();
    });

    const wrapMat = createWrapMaterial(wrap);
    classified.current.forEach((type, mesh) => {
      if (type === 'body') {
        mesh.material = wrapMat.clone();
      }
    });

    const tintMat = createTintMaterial(tint.material);
    tintMat.userData.keepTransparent = true;
    const mats: THREE.MeshPhysicalMaterial[] = [];
    classified.current.forEach((type, mesh) => {
      if (type === 'glass') {
        const cloned = tintMat.clone();
        cloned.userData.keepTransparent = true;
        mesh.material = cloned;
        mats.push(cloned);
      }
    });
    glassMaterials.current = mats;

    onLoaded();
  }, [wrap, carFile, carLabel, onLoaded, tint, wheelIndex]);

  useFrame(() => {
    if (!groupRef.current) return;

    const target = suspensionHeight * 0.15;
    currentYOffset.current += (target - currentYOffset.current) * 0.06;
    if (Math.abs(target - currentYOffset.current) < 0.0001) {
      currentYOffset.current = target;
    }
    groupRef.current.position.y = currentYOffset.current;

    const lerpSpeed = 0.06;
    for (const mat of glassMaterials.current) {
      mat.opacity += (targetTintOpacity.current - mat.opacity) * lerpSpeed;
      if (Math.abs(targetTintOpacity.current - mat.opacity) < 0.001) {
        mat.opacity = targetTintOpacity.current;
      }
      mat.color.lerp(targetTintColor.current, lerpSpeed);
    }
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
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]}>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial
        color="#080a0e"
        roughness={0.15}
        metalness={0.85}
        envMapIntensity={1.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function SceneSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);
  return null;
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(5, 2.2, 5.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.4, 0);

function CameraControls({ isMobile, controlsRef }: {
  isMobile?: boolean;
  controlsRef: React.MutableRefObject<any>;
}) {
  const lastTap = useRef(0);

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
    <EffectComposer multisampling={4}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <N8AO
        aoRadius={0.5}
        intensity={1.5}
        distanceFalloff={0.5}
        halfRes
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
  const controlsRef = useRef<any>(null);

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
          far: 100,
        }}
        gl={{
          antialias: !isMobile,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        shadows
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        className="absolute inset-0 z-10"
        onCreated={({ gl }) => {
          if (canvasRef) canvasRef.current = gl.domElement;
        }}
      >
        <SceneSetup />
        <color attach="background" args={['#080a10']} />
        <fog attach="fog" args={['#080a10', 20, 55]} />

        <ambientLight intensity={0.15} color="#c8d0e8" />

        <spotLight
          position={[6, 10, 6]}
          intensity={120}
          angle={0.35}
          penumbra={0.8}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={isMobile ? 512 : 2048}
          shadow-mapSize-height={isMobile ? 512 : 2048}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
        />

        <spotLight
          position={[-6, 7, -5]}
          intensity={50}
          angle={0.45}
          penumbra={1}
          color="#d0d8e8"
          castShadow
          shadow-mapSize-width={isMobile ? 256 : 1024}
          shadow-mapSize-height={isMobile ? 256 : 1024}
          shadow-bias={-0.0002}
        />

        <spotLight
          position={[0, 3, -8]}
          intensity={30}
          angle={0.6}
          penumbra={0.9}
          color="#e0e0ff"
        />

        <spotLight
          position={[-8, 4, 3]}
          intensity={18}
          angle={0.7}
          penumbra={1}
          color="#d0d8e0"
        />

        <spotLight
          position={[0, 12, 0]}
          intensity={25}
          angle={0.9}
          penumbra={1}
          color="#f0f0ff"
        />

        <pointLight position={[-6, 0.3, 2]} color="#1a2a50" intensity={2} distance={10} decay={2} />
        <pointLight position={[6, 0.3, -2]} color="#301a08" intensity={1.5} distance={10} decay={2} />

        <Environment
          preset="city"
          environmentIntensity={0.8}
          environmentRotation={[0, Math.PI / 4, 0]}
        />

        <Suspense fallback={null}>
          <FadeWrapper carFile={carFile}>
            <CarModel
              wrap={selectedWrap}
              carFile={carFile}
              carLabel={carLabel}
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
