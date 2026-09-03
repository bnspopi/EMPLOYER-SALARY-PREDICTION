"use client";
import { Environment, Lightformer } from "@react-three/drei";

/**
 * Studio-style image-based lighting built entirely from <Lightformer>s so nothing
 * is fetched from a CDN (no preset, no HDR). Warm key + cyan rim + soft fill.
 */
export function StudioEnv() {
  return (
    <Environment resolution={256}>
      <Lightformer
        form="rect"
        intensity={3}
        color="#fff2df"
        position={[3, 4, 3]}
        scale={[6, 6, 1]}
        rotation-y={-Math.PI / 4}
      />
      <Lightformer
        form="rect"
        intensity={4}
        color="#4ad9ff"
        position={[-5, 2, -4]}
        scale={[5, 5, 1]}
        rotation-y={Math.PI / 3}
      />
      <Lightformer form="circle" intensity={1.4} color="#9a9ca3" position={[0, -3, 2]} scale={[8, 8, 1]} />
    </Environment>
  );
}

export function GoldEnv() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={4} color="#ffd27a" position={[2, 4, 3]} scale={[5, 5, 1]} rotation-y={-Math.PI / 4} />
      <Lightformer form="rect" intensity={1.2} color="#4ad9ff" position={[-4, 1, -3]} scale={[4, 4, 1]} />
      <Lightformer form="circle" intensity={1} color="#3a2f18" position={[0, -3, 1]} scale={[8, 8, 1]} />
    </Environment>
  );
}
