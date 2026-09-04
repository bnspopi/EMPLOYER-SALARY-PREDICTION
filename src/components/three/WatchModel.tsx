"use client";
import { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL = "/models/watch.glb";

/**
 * Watch GLB: the dial faces +Y in the asset, so rotate x = +PI/2 to face the camera.
 * The case itself stays still — only <WatchMovement /> (the gear train and hands
 * layered on the dial) animates, so the watch reads as running rather than tumbling.
 */
export function WatchModel() {
  const { scene } = useGLTF(MODEL, false);
  const model = useMemo(() => scene.clone(true), [scene]);

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

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL, false);
