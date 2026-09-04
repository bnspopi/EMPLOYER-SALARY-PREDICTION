"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import type { PointerState } from "@/hooks/usePointer";
import type { ClickTarget } from "@/hooks/useClickTarget";

const MODEL = "/models/robot-head.glb";

interface Props {
  progress: MotionValue<number>;
  pointer: React.MutableRefObject<PointerState>;
  click?: React.MutableRefObject<ClickTarget>;
}

export function RobotHead({ progress, pointer, click }: Props) {
  const { scene } = useGLTF(MODEL, false);
  const group = useRef<THREE.Group>(null);

  // Clone (so repeated mounts never mutate the cached graph), center by bounding
  // box, scale to ~2.2 units tall, light emissive "eye" materials, and derive
  // fallback eye-sphere positions — all deterministic from `scene`.
  const { model } = useMemo(() => {
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
    void found;
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clone.position.sub(center);
    const scale = 2.2 / (size.y || 1);
    clone.scale.setScalar(scale);
    return { model: clone, litEyes: found };
  }, [scene]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = progress.get();
    const ptr = pointer.current;

    // Follow the cursor; before the visitor moves one, drift gently on its own.
    let lookX = ptr.x;
    let lookY = ptr.y;
    if (!ptr.moved) {
      lookX = Math.sin(t * 0.35) * 0.6;
      lookY = Math.sin(t * 0.27) * 0.3;
    }
    // Glance at whatever was just clicked for a moment.
    const c = click?.current;
    if (c && c.at > 0) {
      const since = (performance.now() - c.at) / 1000;
      if (since < 1.1) {
        const w = Math.min(1, (1.1 - since) / 0.5);
        lookX = lookX * (1 - w) + c.x * w;
        lookY = lookY * (1 - w) + -c.y * w;
      }
    }

    // As the camera pushes in, ease the turn back toward frontal — a large yaw at
    // full zoom swings the face out of frame and shows the back of the skull.
    const zoomEase = 1 - p * 0.62;
    const targetY = lookX * 0.55 * zoomEase + p * 0.16;
    const targetX = -lookY * 0.3 * zoomEase;
    const k = 1 - Math.pow(0.0006, delta);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    g.position.y = Math.sin(t) * 0.04;
    g.scale.setScalar(1 + Math.sin(t * 0.8) * 0.01);
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL, false);
