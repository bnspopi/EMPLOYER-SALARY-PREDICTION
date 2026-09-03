"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import type { Group } from "three";
import type { PointerState } from "@/hooks/usePointer";

interface Props {
  progress: MotionValue<number>;
  pointer: React.MutableRefObject<PointerState>;
}

/** Stylized chrome head built from primitives — the fallback when the GLB fails. */
export function ProceduralHead({ progress, pointer }: Props) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.get();
    const targetY = pointer.current.x * 0.45 + p * 0.6;
    const targetX = -pointer.current.y * 0.25;
    const k = 1 - Math.pow(0.001, delta);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    const t = state.clock.elapsedTime;
    g.position.y = Math.sin(t) * 0.04;
    const breathe = 1 + Math.sin(t * 0.8) * 0.012;
    g.scale.setScalar(breathe);
  });

  const chrome = { metalness: 1, roughness: 0.25, color: "#c9ced6" };

  return (
    <group ref={group}>
      {/* cranium */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      {/* face plate */}
      <mesh position={[0, 0.28, 0.34]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.7, 0.66, 0.5]} />
        <meshStandardMaterial {...chrome} roughness={0.18} />
      </mesh>
      {/* jaw */}
      <mesh position={[0, -0.18, 0.12]}>
        <boxGeometry args={[0.66, 0.34, 0.62]} />
        <meshStandardMaterial {...chrome} roughness={0.3} />
      </mesh>
      {/* neck */}
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.4, 24]} />
        <meshStandardMaterial {...chrome} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.18, 32]} />
        <meshStandardMaterial color="#0e1116" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* eyes */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.56]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
