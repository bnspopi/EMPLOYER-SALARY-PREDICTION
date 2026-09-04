"use client";
import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { RobotHead } from "./RobotHead";
import { RobotArm } from "./RobotArm";
import { RobotBody } from "./RobotBody";
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
    // Start wide on the whole figure, then push in to the face as the hero scrolls.
    // Wide on the standing figure, then push in and rise to the face.
    // Wide on the whole standing robot, then push in and rise to the face.
    const targetZ = 12.5 - p * 7.6; // 12.5 → 4.9
    const targetY = -2.9 + p * 2.9;
    const k = 1 - Math.pow(0.01, delta);
    cam.position.z += (targetZ - cam.position.z) * k;
    cam.position.y += (targetY - cam.position.y) * k;
    cam.lookAt(0, -3.1 + p * 3.2, 0);
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
      camera={{ position: [0, -2.9, 12.5], fov: 40 }}
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
      <RobotBody pointer={pointer} />
      <RobotArm click={click} />
      <ContactShadows position={[0, -7.65, 0]} opacity={0.6} scale={18} blur={2.8} far={7} color="#000000" />
    </Canvas>
  );
}
