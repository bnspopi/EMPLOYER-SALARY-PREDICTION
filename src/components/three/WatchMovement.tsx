"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import type { PointerState } from "@/hooks/usePointer";

const gold = { color: "#d9b45a", metalness: 1, roughness: 0.3 };
const roseGold = { color: "#e6b98a", metalness: 1, roughness: 0.22 };
const HALF_PI = Math.PI / 2;

/**
 * The hands, laid over the GLB's dial.
 *
 * The asset already carries a full skeleton movement — gears, tourbillon,
 * indices — so the old procedural gear train drew a second watch on top of the
 * first. Only the hands are added here, and they are what moves: scrolling and
 * the cursor wind them on, and they keep running on their own when neither is.
 */
const TURN = Math.PI * 2;
/** Turns of the minute hand across the whole section as it is scrolled. */
const SCROLL_MINUTES = 2.2;
/** Turns of the minute hand from the cursor sweeping the full width. */
const POINTER_MINUTES = 0.55;

export function WatchMovement({
  scale = 1,
  // Depth of the hand plane. The dial sits deep inside the case, so anything
  // under ~0.8 is swallowed by the crystal and anything much over floats clear
  // of the watch; found by sweeping it against the render.
  z = 0.8,
  progress,
  pointer,
}: {
  scale?: number;
  z?: number;
  /** Scrolling the section winds the hands forward. */
  progress?: MotionValue<number>;
  /** Moving the cursor across the section nudges it too. */
  pointer?: React.MutableRefObject<PointerState>;
}) {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  /** Wind offset shared by every hand, so they stay in step with each other. */
  const wind = useRef(0);
  const spun = useRef(0);

  useFrame((_, delta) => {
    // Scroll and cursor both wind the movement on; time keeps it running when
    // neither is moving, so the watch is alive even standing still.
    const p = progress ? THREE.MathUtils.clamp(progress.get(), 0, 1) : 0;
    const px = pointer?.current.moved ? pointer.current.x : 0;
    const target = p * SCROLL_MINUTES + px * POINTER_MINUTES;
    wind.current += (target - wind.current) * (1 - Math.pow(0.004, delta));
    spun.current += delta;

    // 1 "watch minute" per second of free running, plus the wound-on turns.
    const minutes = spun.current / 60 + wind.current;
    if (second.current) second.current.rotation.z = -minutes * TURN * 60;
    if (minute.current) minute.current.rotation.z = -minutes * TURN;
    if (hour.current) hour.current.rotation.z = -(minutes / 12) * TURN;
  });

  return (
    <group position={[0, 0, z]} scale={scale}>
      {/* hour */}
      <group ref={hour}>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.032, 0.34, 0.012]} />
          <meshStandardMaterial {...roseGold} emissive="#3a2410" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* minute */}
      <group ref={minute} position={[0, 0, 0.014]}>
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[0.024, 0.48, 0.012]} />
          <meshStandardMaterial {...roseGold} emissive="#3a2410" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* second — thin, with a counterweight, so the sweep reads at any zoom */}
      <group ref={second} position={[0, 0, 0.028]}>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.012, 0.52, 0.008]} />
          <meshStandardMaterial color="#ff7a45" emissive="#ff5a1f" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <boxGeometry args={[0.026, 0.18, 0.008]} />
          <meshStandardMaterial color="#ff7a45" emissive="#ff5a1f" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>
      {/* centre cap over the hand stack */}
      <mesh position={[0, 0, 0.04]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 20]} />
        <meshStandardMaterial {...gold} />
      </mesh>
    </group>
  );
}
