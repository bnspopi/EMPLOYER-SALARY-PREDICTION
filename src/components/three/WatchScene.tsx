"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { WatchModel } from "./WatchModel";
import { ProceduralWatch } from "./ProceduralWatch";
import { ModelErrorBoundary } from "./ErrorBoundary";
import { GoldEnv } from "./Env";

const V = THREE.Vector3;

function lerpV(out: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, t: number) {
  return out.copy(a).lerp(b, t);
}

function CameraPath({ progress }: { progress: MotionValue<number> }) {
  const { camera } = useThree();
  const tmpPos = useRef(new V(0.8, 0.6, 4.2));
  const tmpTarget = useRef(new V(0, 0, 0));
  const kf = useMemo(
    () => ({
      posA: new V(0.8, 0.6, 4.2),
      posB: new V(0, 0.2, 2.6),
      posC: new V(0.4, -0.1, 1.4),
      tgtA: new V(0, 0, 0),
      tgtB: new V(0, 0, 0),
      tgtC: new V(0, -0.35, 0),
    }),
    [],
  );

  useFrame((_, delta) => {
    const p = progress.get();
    const pos = tmpPos.current;
    const tgt = tmpTarget.current;
    if (p < 0.33) {
      const t = p / 0.33;
      lerpV(pos, kf.posA, kf.posB, t);
      lerpV(tgt, kf.tgtA, kf.tgtB, t);
    } else if (p < 0.66) {
      const t = (p - 0.33) / 0.33;
      lerpV(pos, kf.posB, kf.posC, t);
      lerpV(tgt, kf.tgtB, kf.tgtC, t);
    } else {
      const t = (p - 0.66) / 0.34;
      lerpV(pos, kf.posB, kf.posC, 1);
      lerpV(tgt, kf.tgtB, kf.tgtC, 1);
      // slight orbit on the macro push
      pos.x = kf.posC.x + Math.sin(t * Math.PI) * 0.35;
    }
    const k = 1 - Math.pow(0.008, delta);
    camera.position.lerp(pos, k);
    camera.lookAt(tgt);
  });
  return null;
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
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

export default function WatchScene({ progress, active, dpr = 1.75 }: Props) {
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0.8, 0.6, 4.2], fov: 42 }}
      frameloop={active ? "always" : "demand"}
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
          <GoldEnv />
        </ModelErrorBoundary>
      </Suspense>
    </Canvas>
  );
}
