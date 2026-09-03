"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
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
  const { scene } = useGLTF(MODEL);
  const group = useRef<THREE.Group>(null);

  // Clone so repeated mounts (dynamic import) never share/mutate a cached graph.
  const model = useMemo(() => scene.clone(true), [scene]);

  // Compute eye positions from the bounding box, and light any emissive "eye" mats.
  const { addedEyes, eyePositions } = useMemo(() => {
    let found = false;
    model.traverse((obj) => {
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
    return { addedEyes: !found, eyePositions: [] as THREE.Vector3[] };
  }, [model]);

  const eyeMeta = useRef({ y: 0.62, x: 0.13, z: 0.5, added: addedEyes });

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    // Center on origin, then scale so the head is ~2.2 units tall.
    model.position.sub(center);
    const scale = 2.2 / (size.y || 1);
    model.scale.setScalar(scale);
    // face +Z by default (asset is authored that way); keep upright.
    eyeMeta.current = {
      y: (0.62 * size.y - size.y / 2) * scale,
      x: 0.13 * size.x * scale,
      z: (size.z / 2) * scale,
      added: addedEyes,
    };
    void eyePositions;
  }, [model, addedEyes, eyePositions]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.get();
    const targetY = pointer.current.x * 0.45 + p * 0.6;
    const targetX = -pointer.current.y * 0.25;
    const k = 1 - Math.pow(0.0015, delta);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    const t = performance.now() / 1000;
    g.position.y = Math.sin(t) * 0.04;
    g.scale.setScalar(1 + Math.sin(t * 0.8) * 0.01);
  });

  return (
    <group ref={group}>
      <primitive object={model} />
      {eyeMeta.current.added
        ? [-1, 1].map((s) => (
            <mesh key={s} position={[s * eyeMeta.current.x, eyeMeta.current.y, eyeMeta.current.z]}>
              <sphereGeometry args={[0.07, 20, 20]} />
              <meshStandardMaterial color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={3} toneMapped={false} />
            </mesh>
          ))
        : null}
    </group>
  );
}

useGLTF.preload(MODEL);
