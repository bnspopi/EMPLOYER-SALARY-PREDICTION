"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group, Mesh } from "three";
import type { PointerState } from "@/hooks/usePointer";
import { EMPLOYEE_CARDS } from "@/components/landing/data";

const skin = { color: "#cdd3db", metalness: 0.2, roughness: 0.6 };
const suit = { color: "#232936", metalness: 0.3, roughness: 0.7 };
const HALF_PI = Math.PI / 2;

interface Props {
  pointer: React.MutableRefObject<PointerState>;
}

/** Low-poly seated figure at a desk with a monitor, typing loop, breathing, and orbiting glass cards. */
export function ProceduralEmployee({ pointer }: Props) {
  const head = useRef<Mesh>(null);
  const torso = useRef<Mesh>(null);
  const foreL = useRef<Group>(null);
  const foreR = useRef<Group>(null);
  const orbit = useRef<Group>(null);

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    if (head.current) {
      head.current.rotation.y += (pointer.current.x * 0.4 - head.current.rotation.y) * (1 - Math.pow(0.01, delta));
      head.current.rotation.x += (pointer.current.y * 0.2 - head.current.rotation.x) * (1 - Math.pow(0.01, delta));
    }
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 1.6) * 0.015;
    if (foreL.current) foreL.current.rotation.x = -0.5 + Math.sin(t * 6) * 0.18;
    if (foreR.current) foreR.current.rotation.x = -0.5 + Math.sin(t * 6 + Math.PI) * 0.18;
    if (orbit.current) {
      orbit.current.rotation.y += delta * 0.12;
      orbit.current.rotation.x = pointer.current.y * 0.12;
    }
  });

  return (
    <group position={[0, -0.8, 0]}>
      {/* seated figure */}
      <group position={[0, 0, 0.2]}>
        <mesh ref={head} position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        <mesh ref={torso} position={[0, 1.0, 0]}>
          <capsuleGeometry args={[0.28, 0.5, 8, 16]} />
          <meshStandardMaterial {...suit} />
        </mesh>
        {/* upper arms + forearms */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.32, 1.16, 0]}>
            <mesh position={[0, -0.18, 0.05]} rotation={[0.4, 0, s * 0.15]}>
              <capsuleGeometry args={[0.08, 0.32, 6, 12]} />
              <meshStandardMaterial {...suit} />
            </mesh>
            <group ref={s === -1 ? foreL : foreR} position={[0, -0.36, 0.16]}>
              <mesh position={[0, -0.12, 0.14]} rotation={[HALF_PI, 0, 0]}>
                <capsuleGeometry args={[0.07, 0.3, 6, 12]} />
                <meshStandardMaterial {...skin} />
              </mesh>
            </group>
          </group>
        ))}
        {/* legs */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.16, 0.5, 0.32]} rotation={[HALF_PI, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.44, 6, 12]} />
            <meshStandardMaterial {...suit} />
          </mesh>
        ))}
      </group>

      {/* desk */}
      <mesh position={[0, 0.62, 0.55]}>
        <boxGeometry args={[2.4, 0.06, 0.9]} />
        <meshStandardMaterial color="#12151c" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* monitor */}
      <group position={[0, 1.1, 0.9]}>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[1.1, 0.66, 0.05]} />
          <meshStandardMaterial color="#0a0c11" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.0, 0.56]} />
          <meshStandardMaterial color="#0b3a4a" emissive="#4ad9ff" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.42, 0.1]}>
          <cylinderGeometry args={[0.05, 0.08, 0.28, 12]} />
          <meshStandardMaterial color="#12151c" />
        </mesh>
      </group>

      {/* orbiting glass data cards */}
      <group ref={orbit} position={[0, 1.2, 0.2]}>
        {EMPLOYEE_CARDS.map((c, i) => {
          const a = (i / EMPLOYEE_CARDS.length) * Math.PI * 2;
          const r = 1.7;
          return (
            <Html
              key={c.label}
              transform
              occlude={false}
              distanceFactor={2.4}
              position={[Math.cos(a) * r, Math.sin(a) * 0.5, Math.sin(a) * r]}
              style={{ pointerEvents: "none" }}
            >
              <div className="glass rounded-xl2 px-4 py-3 text-center" style={{ width: 128 }}>
                <div className="mono-caps text-[9px] text-muted">{c.label}</div>
                <div className="display text-2xl leading-none text-cyan tabular-nums">{c.value}</div>
              </div>
            </Html>
          );
        })}
      </group>
    </group>
  );
}
