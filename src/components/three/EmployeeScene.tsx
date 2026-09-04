"use client";
import { Canvas } from "@react-three/fiber";
import { ProceduralEmployee } from "./ProceduralEmployee";
import { StudioEnv } from "./Env";
import { SceneLights } from "./Lights";
import { usePointer } from "@/hooks/usePointer";

interface Props {
  active: boolean;
  dpr?: number;
}

export default function EmployeeScene({ dpr = 1.75 }: Props) {
  const pointer = usePointer();
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.35, 4.8], fov: 42 }}
      frameloop="always"
    >
      <SceneLights rimIntensity={4} />
      <ProceduralEmployee pointer={pointer} />
      <StudioEnv />
    </Canvas>
  );
}
