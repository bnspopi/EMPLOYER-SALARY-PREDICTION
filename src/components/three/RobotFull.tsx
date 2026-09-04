"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { MotionValue } from "framer-motion";
import type { PointerState } from "@/hooks/usePointer";
import type { ClickTarget } from "@/hooks/useClickTarget";

const MODEL = "/models/robot-full.glb";

/** Standing height in world units, and the floor the feet rest on. */
export const ROBOT_HEIGHT = 9.2;
export const ROBOT_GROUND = -7.65;
/**
 * Height of the hip above the feet. The figure pivots here rather than at the
 * floor: leaning a nine-unit body around its own feet swings the head through
 * half the frame and reads as toppling over, not as looking at you.
 */
const HIP = ROBOT_HEIGHT * 0.52;

interface Props {
  progress: MotionValue<number>;
  pointer: React.MutableRefObject<PointerState>;
  click?: React.MutableRefObject<ClickTarget>;
}

/**
 * The hero figure: a full standing humanoid robot (head, torso, arms, legs),
 * reconstructed from a generated render and shipped as a single welded mesh.
 *
 * Because it is one mesh with no skeleton, the whole body turns to follow the
 * cursor. That is deliberate rather than a limitation: a standing figure that
 * squares up to you reads more naturally than a head swivelling on a static
 * torso would.
 */
export function RobotFull({ progress, pointer, click }: Props) {
  const { scene } = useGLTF(MODEL, false);
  const group = useRef<THREE.Group>(null);

  // Clone (repeated mounts must never mutate the cached graph), relight the
  // armour, smooth the reconstruction's flat normals, centre on the vertical
  // axis with the hip at the group origin, and find the eyes on the real face.
  const { model, eyes } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.castShadow = true;
      // The reconstruction ships per-face normals, which read as hard facets on a
      // 4.7k-triangle body. Weld coincident vertices and re-derive smooth normals.
      try {
        const welded = mergeVertices(obj.geometry, 1e-4);
        welded.computeVertexNormals();
        obj.geometry = welded;
      } catch {
        obj.geometry.computeVertexNormals();
      }
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (!("metalness" in std)) continue;
        // The material is near-unlit as shipped; give the panels enough specular
        // response for the studio rig to actually read on them.
        std.metalness = 0.5;
        std.roughness = 0.36;
        std.envMapIntensity = 1.4;
        std.flatShading = false;
        std.needsUpdate = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = ROBOT_HEIGHT / (size.y || 1);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -box.min.y * scale - HIP, -center.z * scale);
    clone.updateMatrixWorld(true);

    // The reconstruction has no lit eyes, and the hero pushes in on the face — so
    // add them. Guessing coordinates put them on the cheek last time, so instead
    // fire a ray at the face from in front and plant each eye on the surface it
    // actually hits, a hair proud of it. Eye line sits at ~92.5% of standing
    // height, the usual humanoid proportion, and the pupils a little inboard.
    const ray = new THREE.Raycaster();
    const eyeY = ROBOT_GROUND + ROBOT_HEIGHT * 0.925 - (ROBOT_GROUND + HIP);
    const found: [number, number, number][] = [];
    for (const dx of [-ROBOT_HEIGHT * 0.029, ROBOT_HEIGHT * 0.029]) {
      ray.set(new THREE.Vector3(dx, eyeY, ROBOT_HEIGHT), new THREE.Vector3(0, 0, -1));
      const hit = ray.intersectObject(clone, true)[0];
      if (hit) found.push([hit.point.x, hit.point.y, hit.point.z + 0.005]);
    }
    return { model: clone, eyes: found };
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
      lookX = Math.sin(t * 0.31) * 0.55;
      lookY = Math.sin(t * 0.24) * 0.3;
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

    // Yaw is free: the head sits on the axis of rotation, so turning the body
    // barely translates the face and it stays framed at any zoom. Pitch swings
    // the head through an arc even about the hip, so it stays small — and both
    // ease off as the camera closes in, or a big turn shows the back of the head.
    const zoomEase = 1 - p * 0.55;
    const targetY = lookX * 0.5 * zoomEase;
    const targetX = -lookY * 0.05 * zoomEase;
    const k = 1 - Math.pow(0.0009, delta);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;

    // Idle life: breathing, and a slow weight shift from one foot to the other.
    g.position.y = ROBOT_GROUND + HIP + Math.sin(t * 1.1) * 0.035;
    g.position.x = Math.sin(t * 0.42) * 0.07;
    g.scale.y = 1 + Math.sin(t * 1.1) * 0.006;
  });

  return (
    <group ref={group} position={[0, ROBOT_GROUND + HIP, 0]}>
      <primitive object={model} />
      {/* Flattened against the face so they read as inset lenses rather than
          headlamps bolted on the front. */}
      {eyes.map((p) => (
        <mesh key={`${p[0]},${p[1]}`} position={p} scale={[1, 0.62, 0.3]}>
          <sphereGeometry args={[ROBOT_HEIGHT * 0.0075, 20, 16]} />
          <meshStandardMaterial color="#cdf3ff" emissive="#4ad9ff" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      ))}
      {eyes.length > 0 ? (
        <pointLight position={[0, eyes[0][1], eyes[0][2] + 0.35]} color="#4ad9ff" intensity={2} distance={3} decay={2} />
      ) : null}
    </group>
  );
}

useGLTF.preload(MODEL, false);
