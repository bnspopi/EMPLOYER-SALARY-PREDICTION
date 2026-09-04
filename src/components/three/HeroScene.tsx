"use client";
import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { RobotFull, ROBOT_GROUND } from "./RobotFull";
import { RobotArm } from "./RobotArm";
import { RobotBody } from "./RobotBody";
import { ProceduralHead } from "./ProceduralHead";
import { ModelErrorBoundary } from "./ErrorBoundary";
import { StudioEnv } from "./Env";
import { SceneLights } from "./Lights";
import { usePointer } from "@/hooks/usePointer";
import { useClickTarget } from "@/hooks/useClickTarget";

/** Wide framing holds the whole standing figure; the push-in ends head-and-shoulders. */
const WIDE_Z = 13.6;
// Ends head-and-shoulders rather than filling the frame with the face: the body
// is a 4.7k-triangle reconstruction, and a tighter push shows the facets.
const CLOSE_Z = 5.2;
const WIDE_Y = -3.05;
const CLOSE_Y = 0.8;

function CameraRig({ progress }: { progress: MotionValue<number> }) {
  useFrame((state, delta) => {
    const cam = state.camera;
    const p = progress.get();
    // Start wide on the whole standing robot, then push in and rise to the face.
    const targetZ = WIDE_Z + (CLOSE_Z - WIDE_Z) * p;
    const targetY = WIDE_Y + (CLOSE_Y - WIDE_Y) * p;
    const k = 1 - Math.pow(0.01, delta);
    cam.position.z += (targetZ - cam.position.z) * k;
    cam.position.y += (targetY - cam.position.y) * k;
    cam.lookAt(0, targetY, 0);
  });
  return null;
}

/**
 * Degraded stand-in used only if the robot GLB fails to load: the procedural
 * head over the procedural armour body, lifted into the same framing.
 */
function ProceduralFallback({
  progress,
  pointer,
  click,
}: {
  progress: MotionValue<number>;
  pointer: ReturnType<typeof usePointer>;
  click: ReturnType<typeof useClickTarget>;
}) {
  return (
    <group position={[0, 0.9, 0]}>
      <ProceduralHead progress={progress} pointer={pointer} click={click} />
      <RobotBody pointer={pointer} />
    </group>
  );
}

interface Props {
  progress: MotionValue<number>;
  active: boolean;
  dpr?: number;
}

export default function HeroScene({ progress, dpr = 1.75 }: Props) {
  const pointer = usePointer();
  const click = useClickTarget();
  const fallback = <ProceduralFallback progress={progress} pointer={pointer} click={click} />;
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, WIDE_Y, WIDE_Z], fov: 40 }}
      // Always animate while mounted — LazyCanvas unmounts the whole canvas once
      // it is well past the viewport, so "demand" would only freeze the cursor
      // tracking while the hero is actually on screen.
      frameloop="always"
    >
      <CameraRig progress={progress} />
      <SceneLights />
      <Suspense fallback={fallback}>
        <ModelErrorBoundary fallback={fallback}>
          <RobotFull progress={progress} pointer={pointer} click={click} />
          <StudioEnv />
        </ModelErrorBoundary>
      </Suspense>
      <RobotArm click={click} />
      <ContactShadows position={[0, ROBOT_GROUND, 0]} opacity={0.6} scale={20} blur={2.8} far={7} color="#000000" />
    </Canvas>
  );
}
