"use client";
import { Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { RobotHead } from "./RobotHead";
import { ProceduralHead } from "./ProceduralHead";
import { ModelErrorBoundary } from "./ErrorBoundary";
import { StudioEnv } from "./Env";
import { SceneLights } from "./Lights";
import { usePointer } from "@/hooks/usePointer";

function CameraRig({ progress }: { progress: MotionValue<number> }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const p = progress.get();
    const targetZ = 4.6 - p * 1.2; // 4.6 → 3.4
    const k = 1 - Math.pow(0.01, delta);
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

interface Props {
  progress: MotionValue<number>;
  active: boolean;
  dpr?: number;
}

export default function HeroScene({ progress, active, dpr = 1.75 }: Props) {
  const pointer = usePointer();
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.1, 4.6], fov: 40 }}
      frameloop={active ? "always" : "demand"}
    >
      <CameraRig progress={progress} />
      <SceneLights />
      <Suspense fallback={<ProceduralHead progress={progress} pointer={pointer} />}>
        <ModelErrorBoundary fallback={<ProceduralHead progress={progress} pointer={pointer} />}>
          <RobotHead progress={progress} pointer={pointer} />
          <StudioEnv />
        </ModelErrorBoundary>
      </Suspense>
      <ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={7} blur={2.6} far={3} color="#000000" />
    </Canvas>
  );
}
