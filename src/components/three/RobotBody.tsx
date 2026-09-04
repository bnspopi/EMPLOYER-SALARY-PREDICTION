"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { PointerState } from "@/hooks/usePointer";

const HALF_PI = Math.PI / 2;
/** Matches the scanned head: white ceramic shell, chrome mechanics, cyan seams. */
const shell = { color: "#eceef1", metalness: 0.35, roughness: 0.26 };
const shellDim = { color: "#c8ccd3", metalness: 0.5, roughness: 0.34 };
const chrome = { color: "#aeb5bf", metalness: 1, roughness: 0.2 };
const dark = { color: "#0f1216", metalness: 0.9, roughness: 0.35 };

function Seam({ position, width = 0.5, rotation = 0 }: { position: [number, number, number]; width?: number; rotation?: number }) {
  return (
    <mesh position={position} rotation={[0, 0, rotation]}>
      <boxGeometry args={[width, 0.012, 0.012]} />
      <meshStandardMaterial color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={2.6} toneMapped={false} />
    </mesh>
  );
}

/** A chrome piston: rod inside a sleeve, used at the waist and knees. */
function Piston({ position, len = 0.3, r = 0.028 }: { position: [number, number, number]; len?: number; r?: number }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[r * 1.5, r * 1.5, len * 0.55, 12]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[0, -len * 0.4, 0]}>
        <cylinderGeometry args={[r, r, len, 12]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
    </group>
  );
}

/** Shoulder pauldron + articulated arm that idles at the robot's side. */
function IdleArm({ side }: { side: 1 | -1 }) {
  const upper = useRef<THREE.Group>(null);
  const fore = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (upper.current) upper.current.rotation.x = -0.06 + Math.sin(t * 0.6 + side) * 0.045;
    if (fore.current) fore.current.rotation.x = 0.3 + Math.sin(t * 0.6 + side + 0.7) * 0.05;
  });
  return (
    <group position={[side * 0.78, -0.28, 0]}>
      {/* pauldron */}
      <RoundedBox args={[0.42, 0.34, 0.42]} radius={0.11} smoothness={4} castShadow>
        <meshStandardMaterial {...shell} />
      </RoundedBox>
      <mesh rotation={[0, 0, HALF_PI]}>
        <cylinderGeometry args={[0.135, 0.135, 0.46, 20]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <group ref={upper} position={[0, -0.16, 0]}>
        {/* upper arm: chrome bone + shell plate */}
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.078, 0.4, 8, 16]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <RoundedBox args={[0.2, 0.44, 0.2]} radius={0.06} smoothness={4} position={[0, -0.3, 0.01]}>
          <meshStandardMaterial {...shellDim} />
        </RoundedBox>
        <group ref={fore} position={[0, -0.58, 0]}>
          <mesh rotation={[0, 0, HALF_PI]}>
            <cylinderGeometry args={[0.088, 0.088, 0.2, 16]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.065, 0.36, 8, 16]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          <RoundedBox args={[0.17, 0.4, 0.17]} radius={0.05} smoothness={4} position={[0, -0.28, 0.005]}>
            <meshStandardMaterial {...shellDim} />
          </RoundedBox>
          {/* hand at rest */}
          <group position={[0, -0.56, 0.02]}>
            <RoundedBox args={[0.16, 0.19, 0.09]} radius={0.035} smoothness={4}>
              <meshStandardMaterial {...shell} />
            </RoundedBox>
            {[-0.045, -0.015, 0.015, 0.045].map((x, i) => (
              <mesh key={x} position={[x, -0.13, 0.012]} rotation={[0.55, 0, 0]}>
                <capsuleGeometry args={[0.017 - i * 0.001, 0.08, 4, 8]} />
                <meshStandardMaterial {...chrome} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * The robot's body below the scanned head, built to match it: white ceramic
 * armour panels over a chrome skeleton with cyan seams. Chest, segmented
 * abdomen with waist pistons, pelvis and legs, plus a left arm that idles at its
 * side — the right shoulder is where <RobotArm /> reaches out from.
 */
export function RobotBody({ pointer }: { pointer: React.MutableRefObject<PointerState> }) {
  const root = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const k = 1 - Math.pow(0.004, delta);
    if (root.current) {
      const ty = pointer.current.x * 0.12;
      root.current.rotation.y += (ty - root.current.rotation.y) * k;
      root.current.rotation.z += (-pointer.current.x * 0.03 - root.current.rotation.z) * k;
      root.current.position.y = -0.66 + Math.sin(t * 0.8) * 0.012;
    }
    if (chest.current) chest.current.scale.z = 1 + Math.sin(t * 1.3) * 0.016;
    if (core.current) core.current.emissiveIntensity = 2.2 + Math.sin(t * 2.1) * 0.9;
  });

  return (
    <group ref={root} position={[0, -0.66, 0.12]} scale={1.78}>
      {/* clavicle yoke bridging from the neck to the shoulders */}
      <RoundedBox args={[1.28, 0.3, 0.5]} radius={0.13} smoothness={4} position={[0, -0.06, 0]}>
        <meshStandardMaterial {...shell} />
      </RoundedBox>
      <Seam position={[0, -0.06, 0.26]} width={0.72} />

      {/* chest */}
      <group ref={chest}>
        <RoundedBox args={[1.12, 0.86, 0.62]} radius={0.17} smoothness={4} position={[0, -0.6, 0]} castShadow>
          <meshStandardMaterial {...shell} />
        </RoundedBox>
        {/* side vents */}
        {[-1, 1].map((s) => (
          <RoundedBox key={s} args={[0.1, 0.5, 0.4]} radius={0.04} smoothness={3} position={[s * 0.58, -0.6, 0]}>
            <meshStandardMaterial {...dark} />
          </RoundedBox>
        ))}
        {/* sternum housing + reactor core */}
        <mesh position={[0, -0.55, 0.32]} rotation={[HALF_PI, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 28]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <mesh position={[0, -0.55, 0.365]}>
          <sphereGeometry args={[0.085, 22, 22]} />
          <meshStandardMaterial ref={core} color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <Seam position={[0, -0.92, 0.3]} width={0.6} />
      </group>

      {/* waist: chrome spine + pistons between chest and pelvis */}
      <mesh position={[0, -1.16, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.26, 20]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      {[-1, 1].map((s) => (
        <Piston key={s} position={[s * 0.26, -1.14, 0.1]} len={0.3} />
      ))}

      {/* abdomen segments, narrowing to the pelvis */}
      {[0, 1].map((i) => (
        <RoundedBox
          key={i}
          args={[0.78 - i * 0.06, 0.24, 0.46 - i * 0.03]}
          radius={0.09}
          smoothness={4}
          position={[0, -1.42 - i * 0.27, 0]}
        >
          <meshStandardMaterial {...shellDim} />
        </RoundedBox>
      ))}

      {/* pelvis */}
      <RoundedBox args={[0.92, 0.42, 0.56]} radius={0.15} smoothness={4} position={[0, -1.98, 0]}>
        <meshStandardMaterial {...shell} />
      </RoundedBox>
      <Seam position={[0, -1.98, 0.29]} width={0.44} />

      {/* left arm idles; the right shoulder is capped for the reaching arm */}
      <IdleArm side={1} />
      <group position={[-0.78, -0.28, 0]}>
        <RoundedBox args={[0.42, 0.34, 0.42]} radius={0.11} smoothness={4}>
          <meshStandardMaterial {...shell} />
        </RoundedBox>
        <mesh rotation={[0, 0, HALF_PI]}>
          <cylinderGeometry args={[0.135, 0.135, 0.46, 20]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
      </group>

      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.3, -2.24, 0]}>
          <mesh rotation={[0, 0, HALF_PI]}>
            <cylinderGeometry args={[0.145, 0.145, 0.3, 20]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          {/* thigh */}
          <mesh position={[0, -0.44, 0]}>
            <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          <RoundedBox args={[0.28, 0.66, 0.3]} radius={0.09} smoothness={4} position={[0, -0.44, 0.01]}>
            <meshStandardMaterial {...shell} />
          </RoundedBox>
          {/* knee */}
          <mesh position={[0, -0.86, 0]} rotation={[0, 0, HALF_PI]}>
            <cylinderGeometry args={[0.115, 0.115, 0.26, 18]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          <Piston position={[0, -0.86, 0.18]} len={0.26} r={0.022} />
          {/* shin */}
          <mesh position={[0, -1.3, 0]}>
            <capsuleGeometry args={[0.085, 0.58, 8, 16]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          <RoundedBox args={[0.24, 0.62, 0.26]} radius={0.08} smoothness={4} position={[0, -1.3, 0.01]}>
            <meshStandardMaterial {...shellDim} />
          </RoundedBox>
          {/* foot */}
          <RoundedBox args={[0.28, 0.14, 0.5]} radius={0.05} smoothness={4} position={[0, -1.68, 0.09]}>
            <meshStandardMaterial {...dark} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}
