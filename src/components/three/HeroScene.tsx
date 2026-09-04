"use client";
import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { RobotHead } from "./RobotHead";
import { RobotArm } from "./RobotArm";
import { ProceduralHead } from "./ProceduralHead";
import { ModelErrorBoundary } from "./ErrorBoundary";
import { StudioEnv } from "./Env";
import { SceneLights } from "./Lights";
import { usePointer } from "@/hooks/usePointer";
import { useClickTarget } from "@/hooks/useClickTarget";

function CameraRig({ progress }: { progress: MotionValue<number> }) {
  useFrame((state, delta) => {
    const cam = state.camera;
    const p = progress.get();
    const targetZ = 4.6 - p * 1.2; // 4.6 → 3.4
    const k = 1 - Math.pow(0.01, delta);
    cam.position.z += (targetZ - cam.position.z) * k;
    cam.lookAt(0, 0, 0);
  });
  return null;
}

interface Props {
  progress: MotionValue<number>;
  active: boolean;
  dpr?: number;
}

export default function HeroScene({ progress, dpr = 1.75 }: Props) {
  const pointer = usePointer();
  const click = useClickTarget();
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.1, 4.6], fov: 40 }}
      // Always animate while mounted — LazyCanvas unmounts the whole canvas once
      // it is well past the viewport, so "demand" would only freeze the cursor
      // tracking while the hero is actually on screen.
      frameloop="always"
    >
      <CameraRig progress={progress} />
      <SceneLights />
      <Suspense fallback={<ProceduralHead progress={progress} pointer={pointer} click={click} />}>
        <ModelErrorBoundary fallback={<ProceduralHead progress={progress} pointer={pointer} click={click} />}>
          <RobotHead progress={progress} pointer={pointer} click={click} />
          <StudioEnv />
        </ModelErrorBoundary>
      </Suspense>
      <RobotArm click={click} />
      <ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={7} blur={2.6} far={3} color="#000000" />
    </Canvas>
  );
}
