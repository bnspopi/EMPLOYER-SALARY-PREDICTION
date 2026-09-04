"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { usePointer } from "@/hooks/usePointer";
import type { PointerState } from "@/hooks/usePointer";

const HALF_PI = Math.PI / 2;
const skin = { color: "#4a3c33", metalness: 0.05, roughness: 0.85 };
const shirt = { color: "#0c0f15", metalness: 0.15, roughness: 0.9 };
const hair = { color: "#0a0806", metalness: 0.1, roughness: 1 };
const bodyMat = { color: "#14171d", metalness: 0.6, roughness: 0.45 };
const metal = { color: "#6f7681", metalness: 1, roughness: 0.35 };

/**
 * A speech envelope: overlapping sines shaped into syllables with pauses between
 * "sentences", so the jaw motion reads as talking rather than a metronome.
 */
function speech(t: number) {
  const sentence = (t % 7) / 7; // 7s cadence: ~5.2s talking, ~1.8s breath
  if (sentence > 0.76) return 0;
  const syll = Math.sin(t * 11.5) * 0.5 + 0.5;
  const word = Math.sin(t * 3.1) * 0.5 + 0.5;
  const accent = Math.sin(t * 1.7 + 1.2) * 0.5 + 0.5;
  return Math.max(0, syll * (0.45 + word * 0.4) * (0.55 + accent * 0.45));
}

/** Standing presenter: talks to camera, gestures, shifts weight, tracks the cursor. */
function Presenter({ pointer }: { pointer: React.MutableRefObject<PointerState> }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const jaw = useRef<THREE.Mesh>(null);
  const chest = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const v = speech(t);
    const talking = v > 0.02;

    // Jaw opens with the speech envelope.
    if (jaw.current) {
      const open = v * 0.075;
      jaw.current.position.y = -0.085 - open;
      jaw.current.scale.y = 1 + v * 0.5;
    }
    // Head: nods into stressed syllables and turns toward the cursor.
    if (head.current) {
      const targetY = pointer.current.x * 0.32 + 0.12;
      const targetX = pointer.current.y * 0.14 + Math.sin(t * 2.3) * v * 0.05;
      const k = 1 - Math.pow(0.004, delta);
      head.current.rotation.y += (targetY - head.current.rotation.y) * k;
      head.current.rotation.x += (targetX - head.current.rotation.x) * k;
      head.current.rotation.z = Math.sin(t * 0.9) * 0.03;
    }
    // Breathing + a slow weight shift so the stance never freezes.
    if (chest.current) chest.current.scale.y = 1 + Math.sin(t * 1.5) * 0.02;
    if (root.current) {
      root.current.position.x = Math.sin(t * 0.42) * 0.05;
      root.current.rotation.y = Math.sin(t * 0.31) * 0.07;
    }
    // Gestures: the hands lift and settle while talking.
    const g = talking ? (Math.sin(t * 1.6) * 0.5 + 0.5) * v : 0;
    if (armL.current) armL.current.rotation.x = -0.22 - g * 0.5;
    if (armR.current) armR.current.rotation.x = -0.22 - (1 - g) * 0.42;
    if (foreL.current) foreL.current.rotation.x = -0.5 - g * 0.7;
    if (foreR.current) foreR.current.rotation.x = -0.5 - (1 - g) * 0.6;
  });

  return (
    <group ref={root} position={[0.42, -1.15, 0.62]} scale={0.92}>
      {/* head */}
      <group ref={head} position={[0, 1.62, 0]}>
        <mesh>
          <sphereGeometry args={[0.165, 32, 32]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* hair / crown */}
        <mesh position={[0, 0.055, -0.015]} scale={[1.02, 0.6, 1.03]}>
          <sphereGeometry args={[0.166, 24, 24]} />
          <meshStandardMaterial {...hair} />
        </mesh>
        {/* beard line */}
        <mesh position={[0, -0.07, 0.025]} scale={[0.92, 0.55, 0.92]}>
          <sphereGeometry args={[0.158, 20, 20]} />
          <meshStandardMaterial {...hair} roughness={1} />
        </mesh>
        {/* eyes */}
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 0.03, 0.175]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshStandardMaterial color="#101318" roughness={0.4} />
          </mesh>
        ))}
        {/* jaw — drops with the speech envelope */}
        <mesh ref={jaw} position={[0, -0.085, 0.09]}>
          <boxGeometry args={[0.115, 0.055, 0.13]} />
          <meshStandardMaterial color="#181008" roughness={1} />
        </mesh>
      </group>

      {/* neck + torso */}
      <mesh position={[0, 1.43, 0]}>
        <cylinderGeometry args={[0.052, 0.066, 0.16, 16]} />
        <meshStandardMaterial {...skin} />
      </mesh>
      <mesh ref={chest} position={[0, 1.06, 0]}>
        <capsuleGeometry args={[0.185, 0.5, 8, 20]} />
        <meshStandardMaterial {...shirt} />
      </mesh>

      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s} ref={s === -1 ? armL : armR} position={[s * 0.225, 1.28, 0]}>
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, s * 0.12]}>
            <capsuleGeometry args={[0.055, 0.32, 6, 12]} />
            <meshStandardMaterial {...shirt} />
          </mesh>
          <group ref={s === -1 ? foreL : foreR} position={[0, -0.4, 0.02]}>
            <mesh position={[0, -0.16, 0.06]} rotation={[0.35, 0, 0]}>
              <capsuleGeometry args={[0.048, 0.3, 6, 12]} />
              <meshStandardMaterial {...skin} />
            </mesh>
            <mesh position={[0, -0.33, 0.14]}>
              <sphereGeometry args={[0.058, 16, 16]} />
              <meshStandardMaterial {...skin} />
            </mesh>
          </group>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.1, 0.72, 0]}>
          <mesh position={[0, -0.34, 0]}>
            <capsuleGeometry args={[0.075, 0.66, 6, 12]} />
            <meshStandardMaterial color="#0b0e13" metalness={0.15} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.72, 0.06]}>
            <boxGeometry args={[0.16, 0.08, 0.28]} />
            <meshStandardMaterial color="#0d1015" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Cinema camera on a tripod, pointed at the presenter, with a blinking REC lamp. */
function CinemaCamera() {
  const rec = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (rec.current) rec.current.emissiveIntensity = (Math.sin(clock.elapsedTime * 3) > 0 ? 1 : 0) * 4 + 0.4;
  });
  return (
    <group position={[1.78, -1.15, -0.75]} rotation={[0, -0.95, 0]}>
      {/* tripod legs */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3]} rotation={[Math.sin(a) * 0.42, 0, -Math.cos(a) * 0.42]}>
            <cylinderGeometry args={[0.026, 0.026, 1.15, 10]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.06, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.12, 14]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* body */}
      <mesh position={[0, 1.28, 0]}>
        <boxGeometry args={[0.42, 0.34, 0.56]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      {/* lens barrel — aimed at the presenter */}
      <mesh position={[0, 1.28, 0.42]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.36, 24]} />
        <meshStandardMaterial color="#0a0c10" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.28, 0.61]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.03, 24]} />
        <meshStandardMaterial color="#101820" metalness={1} roughness={0.06} />
      </mesh>
      {/* matte box */}
      <mesh position={[0, 1.34, 0.66]}>
        <boxGeometry args={[0.32, 0.26, 0.04]} />
        <meshStandardMaterial color="#0b0d11" roughness={0.8} />
      </mesh>
      {/* top handle + monitor */}
      <mesh position={[0, 1.5, -0.02]}>
        <boxGeometry args={[0.08, 0.06, 0.4]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[-0.3, 1.4, 0.02]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.26, 0.17, 0.02]} />
        <meshStandardMaterial color="#0b3a4a" emissive="#4ad9ff" emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      {/* REC lamp */}
      <mesh position={[0.2, 1.42, 0.2]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial ref={rec} color="#ff2d2d" emissive="#ff2d2d" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PresenterScene({ dpr = 1.5 }: { active?: boolean; dpr?: number }) {
  const pointer = usePointer();
  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.35, 5.4], fov: 40 }}
      frameloop="always"
    >
      <ambientLight intensity={0.12} />
      {/* hard warm rim from behind so the presenter reads as a lit silhouette */}
      <spotLight position={[3.4, 3.6, -2.4]} angle={0.8} penumbra={1} intensity={90} color="#ffa451" distance={18} />
      <spotLight position={[-4.2, 2.4, -2.8]} angle={0.9} penumbra={1} intensity={40} color="#4ad9ff" distance={18} />
      {/* a whisper of frontal fill so the face is not pure black */}
      <directionalLight position={[-1.4, 1.6, 4]} intensity={0.5} color="#ffd9a8" />
      <Presenter pointer={pointer} />
      <CinemaCamera />
      <ContactShadows position={[0, -1.16, 0]} opacity={0.6} scale={11} blur={2.8} far={4} color="#000000" />
      <fog attach="fog" args={["#060708", 6, 14]} />
    </Canvas>
  );
}
