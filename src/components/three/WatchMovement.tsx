"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const gold = { color: "#d9b45a", metalness: 1, roughness: 0.3 };
const brass = { color: "#c69a4e", metalness: 1, roughness: 0.38 };
const steel = { color: "#8d949e", metalness: 1, roughness: 0.28 };
const roseGold = { color: "#e6b98a", metalness: 1, roughness: 0.22 };
const HALF_PI = Math.PI / 2;

interface GearProps {
  radius: number;
  teeth: number;
  thickness?: number;
  /** radians per second; sign sets the direction so meshed gears counter-rotate */
  speed: number;
  position: [number, number, number];
  material?: { color: string; metalness: number; roughness: number };
  spokes?: number;
}

/** One toothed cog: hub + rim + teeth + spokes, spinning about its own Z axis. */
function Gear({ radius, teeth, thickness = 0.05, speed, position, material = brass, spokes = 5 }: GearProps) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  const toothW = (radius * 2 * Math.PI) / teeth / 2.1;
  return (
    <group ref={ref} position={position}>
      {/* rim */}
      <mesh rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[radius, radius, thickness, 40]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {/* teeth */}
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[radius * 0.16, toothW, thickness]} />
            <meshStandardMaterial {...material} />
          </mesh>
        );
      })}
      {/* spokes + hub cut-outs so the gear reads as openworked */}
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return (
          <mesh key={`s${i}`} position={[0, 0, thickness * 0.6]} rotation={[0, 0, a]}>
            <boxGeometry args={[radius * 1.5, radius * 0.12, thickness * 0.5]} />
            <meshStandardMaterial {...material} roughness={0.5} />
          </mesh>
        );
      })}
      <mesh rotation={[HALF_PI, 0, 0]} position={[0, 0, thickness * 0.7]}>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, thickness * 1.2, 20]} />
        <meshStandardMaterial {...steel} />
      </mesh>
    </group>
  );
}

/**
 * The exposed skeleton movement laid over the watch dial: an intermeshing gear
 * train that actually turns, a rotating tourbillon cage, and hour / minute /
 * second hands running at their true relative speeds (time-lapsed so the motion
 * is visible). Faces +Z, centred on the dial.
 */
export function WatchMovement({ scale = 1, z = 0.42 }: { scale?: number; z?: number }) {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  const tourbillon = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // 1 "watch minute" per second — fast enough to read as running.
    if (second.current) second.current.rotation.z -= delta * ((Math.PI * 2) / 1);
    if (minute.current) minute.current.rotation.z -= delta * ((Math.PI * 2) / 60);
    if (hour.current) hour.current.rotation.z -= delta * ((Math.PI * 2) / 720);
    if (tourbillon.current) tourbillon.current.rotation.z += delta * 1.6;
  });

  return (
    <group position={[0, 0, z]} scale={scale}>
      {/* chapter ring + indices */}
      <mesh rotation={[HALF_PI, 0, 0]}>
        <torusGeometry args={[0.86, 0.022, 16, 72]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.76, Math.sin(a) * 0.76, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.1, 0.026, 0.02]} />
            <meshStandardMaterial {...roseGold} emissive="#3a2a12" emissiveIntensity={0.5} />
          </mesh>
        );
      })}

      {/* gear train — meshed pairs counter-rotate, ratios follow the tooth counts */}
      <Gear radius={0.3} teeth={26} speed={0.55} position={[-0.34, 0.2, -0.03]} material={brass} />
      <Gear radius={0.19} teeth={16} speed={-0.9} position={[0.02, 0.3, -0.03]} material={gold} spokes={4} />
      <Gear radius={0.24} teeth={20} speed={0.7} position={[0.38, 0.16, -0.03]} material={brass} />
      <Gear radius={0.15} teeth={13} speed={-1.25} position={[0.34, -0.22, -0.03]} material={steel} spokes={3} />
      <Gear radius={0.21} teeth={18} speed={0.85} position={[-0.3, -0.3, -0.03]} material={gold} spokes={4} />

      {/* tourbillon cage at six o'clock */}
      <group ref={tourbillon} position={[0, -0.5, 0.01]}>
        <mesh rotation={[HALF_PI, 0, 0]}>
          <torusGeometry args={[0.17, 0.018, 12, 32]} />
          <meshStandardMaterial {...steel} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} rotation={[0, 0, a]}>
              <boxGeometry args={[0.32, 0.018, 0.018]} />
              <meshStandardMaterial {...steel} />
            </mesh>
          );
        })}
        <mesh>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial {...roseGold} />
        </mesh>
      </group>

      {/* hands */}
      <group ref={hour} position={[0, 0, 0.08]}>
        <mesh position={[0, 0.19, 0]}>
          <boxGeometry args={[0.032, 0.4, 0.016]} />
          <meshStandardMaterial {...roseGold} />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.29, 0]}>
          <boxGeometry args={[0.024, 0.62, 0.014]} />
          <meshStandardMaterial {...roseGold} />
        </mesh>
      </group>
      <group ref={second} position={[0, 0, 0.12]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.012, 0.7, 0.01]} />
          <meshStandardMaterial color="#ff5a2e" emissive="#ff5a2e" emissiveIntensity={0.6} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      {/* centre cap */}
      <mesh position={[0, 0, 0.14]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.05, 20]} />
        <meshStandardMaterial {...gold} />
      </mesh>
    </group>
  );
}
