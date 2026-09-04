"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PointerState } from "@/hooks/usePointer";
import { EMPLOYEE_CARDS } from "@/components/landing/data";

/**
 * The holographic layer for "Your profile, at work".
 *
 * The backdrop photograph already shows a real person working at a laptop, so this
 * scene deliberately adds no figure of its own — a second, cruder body would only
 * crowd them and (as before) mask their face. Instead it floats the profile's live
 * numbers around them as glass panels that drift, tilt with the cursor and catch
 * the light, plus a slow particle field for depth.
 */
export function ProceduralEmployee({ pointer }: { pointer: React.MutableRefObject<PointerState> }) {
  const orbit = useRef<THREE.Group>(null);
  const panels = useRef<THREE.Group>(null);
  const motes = useRef<THREE.Points>(null);

  // Deterministic scatter so the field is identical on every render (and on the server).
  const dust = useMemo(() => {
    let seed = 0x2545f491;
    const rnd = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const arr = new Float32Array(220 * 3);
    for (let i = 0; i < 220; i++) {
      arr[i * 3] = (rnd() - 0.5) * 7;
      arr[i * 3 + 1] = (rnd() - 0.5) * 4;
      arr[i * 3 + 2] = (rnd() - 0.5) * 4 - 0.5;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.02, delta);
    if (orbit.current) {
      orbit.current.rotation.y += delta * 0.14;
      const tx = pointer.current.y * 0.14;
      orbit.current.rotation.x += (tx - orbit.current.rotation.x) * k;
    }
    if (panels.current) {
      const ty = pointer.current.x * 0.22;
      panels.current.rotation.y += (ty - panels.current.rotation.y) * k;
      panels.current.position.y = Math.sin(t * 0.8) * 0.05;
    }
    if (motes.current) motes.current.rotation.y += delta * 0.02;
  });

  return (
    <group>
      {/* floating glass chart panels, angled away from the centre of frame */}
      <group ref={panels}>
        {[
          { pos: [-1.42, 0.36, 0.35] as const, rot: 0.42, w: 0.95, h: 0.62 },
          { pos: [1.5, 0.66, 0.1] as const, rot: -0.5, w: 0.82, h: 0.53 },
          { pos: [1.32, -0.52, 0.6] as const, rot: -0.35, w: 0.72, h: 0.46 },
        ].map((p, i) => (
          <group key={i} position={[p.pos[0], p.pos[1], p.pos[2]]} rotation={[0, p.rot, 0]}>
            <mesh>
              <planeGeometry args={[p.w, p.h]} />
              <meshStandardMaterial
                color="#0b2a3a"
                emissive="#4ad9ff"
                emissiveIntensity={0.42}
                transparent
                opacity={0.5}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* bar-chart bars inside the panel */}
            {[0.22, 0.4, 0.3, 0.52, 0.36].map((h, j) => (
              <mesh key={j} position={[-p.w / 2 + 0.16 + j * (p.w - 0.3) / 4, -p.h / 2 + h / 2 + 0.08, 0.012]}>
                <planeGeometry args={[0.055, h * (p.h / 0.68)]} />
                <meshStandardMaterial color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={1.5} toneMapped={false} transparent opacity={0.85} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* the live numbers, orbiting clear of the centre where the person sits */}
      <group ref={orbit} position={[0, 1.02, 0]}>
        {EMPLOYEE_CARDS.map((c, i) => {
          const a = (i / EMPLOYEE_CARDS.length) * Math.PI * 2;
          const r = 1.42;
          return (
            <Html
              key={c.label}
              transform
              occlude={false}
              distanceFactor={3.4}
              position={[Math.cos(a) * r, 0.15 + Math.sin(a * 2) * 0.22, Math.sin(a) * r]}
              style={{ pointerEvents: "none" }}
            >
              <div className="glass rounded-xl2 px-4 py-3 text-center" style={{ width: 132 }}>
                <div className="mono-caps text-[9px] text-muted">{c.label}</div>
                <div className="display text-2xl leading-none text-cyan tabular-nums">{c.value}</div>
              </div>
            </Html>
          );
        })}
      </group>

      {/* fine particulate for depth */}
      <points ref={motes}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#4ad9ff"
          size={0.022}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
