"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

const gold = { color: "#d9b45a", metalness: 1, roughness: 0.28 };
const roseGold = { color: "#e6b98a", metalness: 1, roughness: 0.22 };
const HALF_PI = Math.PI / 2;

/** Torus bezel + case + dial + rotating hands + gears — the watch fallback. Built facing +Z. */
export function ProceduralWatch() {
  const hands = useRef<Group>(null);
  const gears = useRef<Group>(null);
  const root = useRef<Group>(null);

  useFrame((_, delta) => {
    if (hands.current) hands.current.rotation.z -= delta * 0.6;
    if (gears.current) gears.current.rotation.z += delta * 0.8;
    if (root.current) root.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={root}>
      {/* bezel */}
      <mesh>
        <torusGeometry args={[1.05, 0.14, 24, 64]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      {/* case back */}
      <mesh position={[0, 0, -0.14]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.24, 64]} />
        <meshStandardMaterial color="#161310" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* dial */}
      <mesh position={[0, 0, 0.0]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 0.05, 64]} />
        <meshStandardMaterial color="#0a0a0c" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* indices */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0.06]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.12, 0.03, 0.02]} />
            <meshStandardMaterial {...roseGold} emissive="#3a2a12" emissiveIntensity={0.4} />
          </mesh>
        );
      })}
      {/* hands */}
      <group ref={hands} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.03, 0.62, 0.02]} />
          <meshStandardMaterial {...roseGold} />
        </mesh>
        <mesh position={[0.16, 0.12, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <boxGeometry args={[0.025, 0.44, 0.02]} />
          <meshStandardMaterial {...roseGold} />
        </mesh>
        <mesh rotation={[HALF_PI, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 16]} />
          <meshStandardMaterial {...gold} />
        </mesh>
      </group>
      {/* movement gears in the lower dial */}
      <group ref={gears} position={[0, -0.42, 0.03]}>
        {[0.16, 0.1].map((r, i) => (
          <mesh key={r} position={[i === 0 ? -0.12 : 0.14, 0, 0]} rotation={[HALF_PI, 0, 0]}>
            <cylinderGeometry args={[r, r, 0.04, 12]} />
            <meshStandardMaterial {...gold} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
