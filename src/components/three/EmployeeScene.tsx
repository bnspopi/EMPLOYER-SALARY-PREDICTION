"use client";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { ProceduralEmployee } from "./ProceduralEmployee";
import { StudioEnv } from "./Env";
import { SceneLights } from "./Lights";
import { usePointer } from "@/hooks/usePointer";

interface Props {
  active: boolean;
  dpr?: number;
}

export default function EmployeeScene({ active, dpr = 1.75 }: Props) {
  const pointer = usePointer();
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.1, 4.2], fov: 42 }}
      frameloop={active ? "always" : "demand"}
    >
      <SceneLights rimIntensity={4} />
      <ProceduralEmployee pointer={pointer} />
      <StudioEnv />
      <ContactShadows position={[0, -0.85, 0]} opacity={0.45} scale={6} blur={2.4} far={3} color="#000000" />
    </Canvas>
  );
}
