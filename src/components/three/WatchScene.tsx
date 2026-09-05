"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { WatchModel } from "./WatchModel";
import { ProceduralWatch } from "./ProceduralWatch";
import { WatchMovement } from "./WatchMovement";
import { ModelErrorBoundary } from "./ErrorBoundary";
import { GoldEnv } from "./Env";
import { usePointer } from "@/hooks/usePointer";

const V = THREE.Vector3;

/**
 * The dial sits at z ≈ 0.42 and the case is 2.4 across, so at fov 42 the whole
 * watch needs the camera about 3.1 out and the dial fills the frame at about
 * 2.75. Any closer and the camera is inside the case: the old path ended at 1.4,
 * which pushed straight through the crystal into unreadable brass. The push now
 * runs the full length of the section and stops with the dial filling the frame.
 */
const FAR_Z = 5;
const CLOSEST_Z = 2.35;

/**
 * A straight push onto the face of the watch.
 *
 * The camera stays on the dial's axis the whole way — no orbit, no oblique
 * offset — so the visitor is always looking at the front of the watch rather
 * than across its side. The near end stops at 2.7: the dial sits at z ≈ 0.42 and
 * the case is 2.4 across, so at fov 42 that is where the dial fills the frame.
 * The old path ran to 1.4, which put the camera inside the case and filled the
 * screen with unreadable brass.
 */
function CameraPath({ progress }: { progress: MotionValue<number> }) {
  const tmpPos = useRef(new V(0, 0, FAR_Z));
  const target = useMemo(() => new V(0, 0, 0.3), []);

  useFrame((state, delta) => {
    const camera = state.camera;
    const p = THREE.MathUtils.clamp(progress.get(), 0, 1);
    // Ease so the push settles onto the dial rather than arriving at full speed.
    const eased = p * p * (3 - 2 * p);
    tmpPos.current.set(0, 0, FAR_Z + (CLOSEST_Z - FAR_Z) * eased);
    const k = 1 - Math.pow(0.008, delta);
    camera.position.lerp(tmpPos.current, k);
    camera.lookAt(target);
  });
  return null;
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // Deterministic (mulberry32) so the buffer is stable across re-renders.
    let seed = 0x9e3779b9;
    const rnd = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const arr = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      arr[i * 3] = (rnd() - 0.5) * 6;
      arr[i * 3 + 1] = (rnd() - 0.5) * 6;
      arr[i * 3 + 2] = (rnd() - 0.5) * 4 - 1;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const a = attr.array as Float32Array;
    for (let i = 0; i < a.length; i += 3) {
      a[i + 1] += delta * 0.15;
      if (a[i + 1] > 3) a[i + 1] = -3;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d9b45a" size={0.02} sizeAttenuation transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

interface Props {
  progress: MotionValue<number>;
  active: boolean;
  dpr?: number;
}

export default function WatchScene({ progress, dpr = 1.75 }: Props) {
  const pointer = usePointer();
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, FAR_Z], fov: 42 }}
      frameloop="always"
    >
      <color attach="background" args={["#060708"]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[2, 4, 3]} intensity={3.2} color="#ffd27a" />
      <spotLight position={[-4, 1, -3]} angle={0.6} penumbra={1} intensity={2} color="#4ad9ff" />
      <CameraPath progress={progress} />
      <Dust />
      <Suspense fallback={<ProceduralWatch />}>
        <ModelErrorBoundary fallback={<ProceduralWatch />}>
          <WatchModel />
          {/* The case is a static mesh; the hands and gear train are what move. */}
          <WatchMovement progress={progress} pointer={pointer} />
          <GoldEnv />
        </ModelErrorBoundary>
      </Suspense>
    </Canvas>
  );
}
