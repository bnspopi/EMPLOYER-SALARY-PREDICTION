"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import type { PointerState } from "@/hooks/usePointer";

const MODEL = "/models/robot-head.glb";

interface Props {
  progress: MotionValue<number>;
  pointer: React.MutableRefObject<PointerState>;
}

export function RobotHead({ progress, pointer }: Props) {
  const { scene } = useGLTF(MODEL, false);
  const group = useRef<THREE.Group>(null);

  // Clone (so repeated mounts never mutate the cached graph), center by bounding
  // box, scale to ~2.2 units tall, light emissive "eye" materials, and derive
  // fallback eye-sphere positions — all deterministic from `scene`.
  const { model, addedEyes, eyePos } = useMemo(() => {
    const clone = scene.clone(true);
    let found = false;
    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        const name = `${obj.name} ${m.name ?? ""}`.toLowerCase();
        if (name.includes("eye") && "emissive" in std) {
          std.emissive = new THREE.Color("#4ad9ff");
          std.emissiveIntensity = 4;
          std.toneMapped = false;
          std.needsUpdate = true;
          found = true;
        }
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clone.position.sub(center);
    const scale = 2.2 / (size.y || 1);
    clone.scale.setScalar(scale);
    return {
      model: clone,
      addedEyes: !found,
      eyePos: {
        x: 0.13 * size.x * scale,
        y: (0.62 * size.y - size.y / 2) * scale,
        z: (size.z / 2) * scale,
      },
    };
  }, [scene]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.get();
    const targetY = pointer.current.x * 0.45 + p * 0.6;
    const targetX = -pointer.current.y * 0.25;
    const k = 1 - Math.pow(0.0015, delta);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    const t = state.clock.elapsedTime;
    g.position.y = Math.sin(t) * 0.04;
    g.scale.setScalar(1 + Math.sin(t * 0.8) * 0.01);
  });

  return (
    <group ref={group}>
      <primitive object={model} />
      {addedEyes
        ? [-1, 1].map((s) => (
            <mesh key={s} position={[s * eyePos.x, eyePos.y, eyePos.z]}>
              <sphereGeometry args={[0.07, 20, 20]} />
              <meshStandardMaterial color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={3} toneMapped={false} />
            </mesh>
          ))
        : null}
    </group>
  );
}

useGLTF.preload(MODEL, false);
