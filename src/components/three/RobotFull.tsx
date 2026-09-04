"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { MotionValue } from "framer-motion";
import type { PointerState } from "@/hooks/usePointer";
import type { ClickTarget } from "@/hooks/useClickTarget";
import { buildRobotRig, solveArmIK, type ArmSegments } from "./robotArmRig";

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

/** The plane just in front of the chest that the robot taps. */
const TAP_PLANE_Z = 1.35;
/**
 * The gesture is a slow point, not a tap. The robot is directing your attention
 * to what you clicked, so it extends deliberately, holds long enough for the
 * pose to read as "look here", and eases back unhurried.
 */
const REACH_IN = 0.7; // s — deliberate extend
const HOLD = 1.2; // s — hold the point
const REACH_OUT = 0.95; // s — unhurried return
const GESTURE = REACH_IN + HOLD + REACH_OUT;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Matched to the dark joint bands the model already carries at its elbows and
// knees — fully metal reads as near-black against this dim studio.
const jointMat = { color: "#8b939c", metalness: 0.85, roughness: 0.44 };

/**
 * Re-expresses a geometry with plain float attributes.
 *
 * The optimized GLB stores positions as normalized integers (meshopt
 * quantization, with a compensating node scale). Baking a transform into that
 * writes float results straight back into the integer array, which truncates
 * them and scrambles the mesh — so widen to Float32 before touching it.
 */
function toFloatGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  for (const name of ["position", "normal", "uv"]) {
    const a = src.getAttribute(name);
    if (!a) continue;
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) {
      out[i * a.itemSize] = a.getX(i);
      if (a.itemSize > 1) out[i * a.itemSize + 1] = a.getY(i);
      if (a.itemSize > 2) out[i * a.itemSize + 2] = a.getZ(i);
    }
    g.setAttribute(name, new THREE.BufferAttribute(out, a.itemSize));
  }
  const index = src.getIndex();
  if (index) g.setIndex(Array.from(index.array as ArrayLike<number>));
  return g;
}

function Arm({
  arm,
  rig,
  material,
  shoulderRef,
  elbowRef,
}: {
  arm: ArmSegments;
  rig: ReturnType<typeof buildRobotRig>;
  material: THREE.Material;
  shoulderRef: React.RefObject<THREE.Group | null>;
  elbowRef: React.RefObject<THREE.Group | null>;
}) {
  return (
    <>
      {/* Socket in the torso, fixed to the body so it plugs the cut when the arm lifts. */}
      <mesh position={arm.shoulder}>
        <sphereGeometry args={[rig.socketR, 22, 22]} />
        <meshStandardMaterial {...jointMat} />
      </mesh>
      <group ref={shoulderRef} position={arm.shoulder}>
        <mesh geometry={arm.upper} material={material} castShadow />
        {/* Ball joints cap the stumps left by the cut. */}
        <mesh>
          <sphereGeometry args={[rig.shoulderR, 22, 22]} />
          <meshStandardMaterial {...jointMat} />
        </mesh>
        <group ref={elbowRef} position={arm.elbowOffset}>
          <mesh geometry={arm.fore} material={material} castShadow />
          <mesh>
            <sphereGeometry args={[rig.elbowR, 20, 20]} />
            <meshStandardMaterial {...jointMat} />
          </mesh>
          <group position={arm.wristOffset}>
            <mesh geometry={arm.hand} material={material} castShadow />
            <mesh>
              <sphereGeometry args={[rig.wristR, 18, 18]} />
              <meshStandardMaterial {...jointMat} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

interface Props {
  progress: MotionValue<number>;
  pointer: React.MutableRefObject<PointerState>;
  click?: React.MutableRefObject<ClickTarget>;
}

/**
 * The hero figure: a full standing humanoid robot (head, torso, arms, legs).
 *
 * The mesh is one welded shell with no skeleton, so the whole body turns to
 * follow the cursor — which reads naturally for a standing figure. Both of its
 * arms are cut out of that shell by <buildRobotRig> and driven by IK, so when
 * you click something in the top sections the robot reaches out and taps it with
 * its own hand — the one on the side you clicked.
 */
export function RobotFull({ progress, pointer, click }: Props) {
  const { scene } = useGLTF(MODEL, false);
  const group = useRef<THREE.Group>(null);
  // One pair of joints per arm: index 0 is the arm on screen-left.
  const shoulderL = useRef<THREE.Group>(null);
  const elbowL = useRef<THREE.Group>(null);
  const shoulderR = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  const { rig, material, eyes } = useMemo(() => {
    const clone = scene.clone(true);
    let mesh: THREE.Mesh | null = null;
    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      // The reconstruction ships per-face normals, which read as hard facets on a
      // 4.7k-triangle body. Weld coincident vertices and re-derive smooth normals.
      const float = toFloatGeometry(obj.geometry);
      try {
        const welded = mergeVertices(float, 1e-4);
        welded.computeVertexNormals();
        obj.geometry = welded;
      } catch {
        float.computeVertexNormals();
        obj.geometry = float;
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
      if (!mesh) mesh = obj;
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

    const src = mesh as THREE.Mesh | null;
    if (!src) throw new Error("robot-full.glb contains no mesh");
    // Bake the fit transform into the geometry so the rig it produces needs no
    // further transform and shares one space with the eye raycast below.
    const baked = src.geometry.clone().applyMatrix4(src.matrixWorld);
    const rig = buildRobotRig(baked);
    const material = (Array.isArray(src.material) ? src.material[0] : src.material) as THREE.Material;

    // The reconstruction has no lit eyes, and the hero pushes in on the face — so
    // add them. Guessing coordinates put them on the cheek last time, so instead
    // fire a ray at the face from in front and plant each eye on the surface it
    // actually hits. Eye line sits at ~92.5% of standing height, the usual
    // humanoid proportion, and the pupils a little inboard.
    const probe = new THREE.Mesh(rig.body);
    const ray = new THREE.Raycaster();
    const eyeY = ROBOT_GROUND + ROBOT_HEIGHT * 0.925 - (ROBOT_GROUND + HIP);
    const found: [number, number, number][] = [];
    for (const dx of [-ROBOT_HEIGHT * 0.029, ROBOT_HEIGHT * 0.029]) {
      ray.set(new THREE.Vector3(dx, eyeY, ROBOT_HEIGHT), new THREE.Vector3(0, 0, -1));
      const hit = ray.intersectObject(probe, false)[0];
      if (hit) found.push([hit.point.x, hit.point.y, hit.point.z + 0.005]);
    }
    return { rig, material, eyes: found };
  }, [scene]);

  // Animation scratch kept in refs (not useMemo) so it is legitimately mutable
  // across frames without tripping the "don't mutate after render" rule.
  const arm = useRef({ seq: 0, start: -1, reach: 0, side: 0 as 0 | 1 });
  const vecs = useRef({
    hit: new THREE.Vector3(),
    target: new THREE.Vector3(),
    tmp: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    q1: new THREE.Quaternion(),
    q2: new THREE.Quaternion(),
  });

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
    const c = click?.current;
    if (c && c.at > 0) {
      // Keep looking at what it is pointing at for as long as it points —
      // easing in as the arm lifts and out as it lowers.
      const since = (performance.now() - c.at) / 1000;
      if (since < GESTURE) {
        const w = Math.min(1, since / 0.45, (GESTURE - since) / 0.7);
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

    // ---- the near hand reaches out and taps whatever was clicked ----
    const v = vecs.current;
    const s = arm.current;
    if (c && c.seq !== s.seq) {
      s.seq = c.seq;
      s.start = t;
      // Reach with the hand on the side that was clicked, so the robot never
      // swings an arm across its own chest to press something beside it.
      s.side = c.x < 0 ? 0 : 1;
      // Project the click (NDC) onto the tap plane, then into the body's own
      // space — the body has already turned toward the click, so the arm reaches
      // where the visitor actually pressed.
      v.tmp.set(c.x, c.y, 0.5).unproject(state.camera);
      v.dir.copy(v.tmp).sub(state.camera.position).normalize();
      const planeZ = g.position.z + TAP_PLANE_Z;
      const d = Math.abs(v.dir.z) < 1e-4 ? 0 : (planeZ - state.camera.position.z) / v.dir.z;
      v.hit.copy(state.camera.position).addScaledVector(v.dir, d);
      g.worldToLocal(v.hit);
    }

    let poke = 0;
    if (s.start >= 0) {
      const e = t - s.start;
      if (e < REACH_IN) {
        s.reach = easeOutCubic(e / REACH_IN);
      } else if (e < REACH_IN + HOLD) {
        s.reach = 1;
        // A held gesture drifts rather than freezing, but never jabs: this is
        // directing attention, not pressing a button.
        poke = Math.sin((e - REACH_IN) * 1.5) * 0.05;
      } else if (e < REACH_IN + HOLD + REACH_OUT) {
        s.reach = 1 - easeInOutCubic((e - REACH_IN - HOLD) / REACH_OUT);
      } else {
        s.reach = 0;
        s.start = -1;
      }
    }

    // Soft convergence (~0.15 s) so the limb glides rather than snapping.
    const ik = 1 - Math.pow(0.001, delta);
    const joints: [React.RefObject<THREE.Group | null>, React.RefObject<THREE.Group | null>][] = [
      [shoulderL, elbowL],
      [shoulderR, elbowR],
    ];
    for (let i = 0; i < 2; i++) {
      const a = rig.arms[i];
      // Only the chosen hand reaches; the other stays parked at its side.
      const reach = i === s.side ? s.reach : 0;
      v.target.copy(a.restWrist).lerp(v.hit, reach);
      v.target.z += reach * poke;
      if (reach < 0.02) v.target.y += Math.sin(t * 0.9 + i) * 0.03;
      solveArmIK(a, v.target, v.q1, v.q2);
      const [sh, el] = joints[i];
      if (sh.current) sh.current.quaternion.slerp(v.q1, ik);
      if (el.current) el.current.quaternion.slerp(v.q2, ik);
    }

    if (ring.current) {
      ring.current.position.copy(v.hit);
      // Fades up with the reach and pulses slowly while held, rather than
      // flashing once on contact.
      const vis = THREE.MathUtils.clamp((s.reach - 0.3) / 0.45, 0, 1);
      ring.current.visible = vis > 0.01;
      ring.current.scale.setScalar((0.78 + Math.sin(t * 2.1) * 0.09) * (1 + (1 - vis) * 0.5));
      (ring.current.material as THREE.MeshBasicMaterial).opacity = vis * 0.7;
    }
  });

  return (
    <group ref={group} position={[0, ROBOT_GROUND + HIP, 0]}>
      <mesh geometry={rig.body} material={material} castShadow />

      {/* Both of the robot's own arms, cut from the same mesh and hung on IK joints. */}
      <Arm arm={rig.arms[0]} rig={rig} material={material} shoulderRef={shoulderL} elbowRef={elbowL} />
      <Arm arm={rig.arms[1]} rig={rig} material={material} shoulderRef={shoulderR} elbowRef={elbowR} />

      {/* Flattened against the face so they read as inset lenses rather than
          headlamps bolted on the front. */}
      {eyes.map((e) => (
        <mesh key={`${e[0]},${e[1]}`} position={e} scale={[1, 0.62, 0.3]}>
          <sphereGeometry args={[ROBOT_HEIGHT * 0.0075, 20, 16]} />
          <meshStandardMaterial color="#cdf3ff" emissive="#4ad9ff" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      ))}
      {eyes.length > 0 ? (
        <pointLight position={[0, eyes[0][1], eyes[0][2] + 0.35]} color="#4ad9ff" intensity={2} distance={3} decay={2} />
      ) : null}

      {/* Tap ripple at the touch point. */}
      <mesh ref={ring} visible={false}>
        <ringGeometry args={[0.2, 0.25, 40]} />
        <meshBasicMaterial color="#4ad9ff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL, false);
