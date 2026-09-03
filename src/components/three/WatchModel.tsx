"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL = "/models/watch.glb";

/** Watch GLB: dial faces +Y in the asset, so rotate x = +PI/2 to face the camera. */
export function WatchModel() {
  const { scene } = useGLTF(MODEL, false);
  const model = useMemo(() => scene.clone(true), [scene]);
  const spin = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    model.position.sub(center);
    const scale = 2.4 / (Math.max(size.x, size.y, size.z) || 1);
    model.scale.setScalar(scale);
  }, [model]);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.z += delta * 0.08;
  });

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <group ref={spin}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL, false);
