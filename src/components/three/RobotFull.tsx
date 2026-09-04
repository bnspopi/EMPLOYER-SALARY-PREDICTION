"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { MotionValue } from "framer-motion";
import type { PointerState } from "@/hooks/usePointer";
import type { ClickTarget } from "@/hooks/useClickTarget";
import { buildRobotRig, solveArmIK, type ArmSegments } from "./robotArmRig";
import {
  GESTURE,
  GREET_DELAY,
  GREET_IN,
  GREET_OUT,
  GREET_SWING,
  GREET_TOTAL,
  GREET_WAVE,
  HOLD,
  REACH_IN,
  REACH_OUT,
  RIPPLE,
} from "@/lib/gesture";

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
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Matched to the dark joint bands the model already carries at its elbows and
// knees — fully metal reads as near-black against this dim studio.
const jointMat = { color: "#8b939c", metalness: 0.85, roughness: 0.44 };

/**
 * Eye placement, as fractions of standing height.
 *
 * The sculpt ships without eyes, and without sockets deep enough to find by
 * probing — a depth sweep across the face returns a smooth surface with a single
 * nose ridge and no concavity. So the position comes from proportion instead:
 * the eye line sits 45% down the head, and the pupils half a face half-width out
 * from centre. Depth and surface angle still come from a ray cast at the face,
 * so the eyes lie flush against it however the head is actually shaped.
 */
const EYE_HEIGHT = 0.943;
const EYE_SPREAD = 0.0195;
const EYE_R = 0.0052;
const FORWARD = new THREE.Vector3(0, 0, 1);

/** The robot waves with the hand on screen-left — a greeting hand, mirrored. */
const GREET_ARM = 0;
/** Raised-hand pose, as fractions of the arm's own span from its shoulder. */
const GREET_OUT_X = 0.38;
const GREET_UP = 0.36;
const GREET_FWD = 0.52;
/** How far the hand swings either side while waving. */
const GREET_SWAY = 0.18;

/**
 * Greet once per page load. The hero canvas unmounts when it is scrolled well
 * past and remounts on the way back, and a robot that waves every time you
 * scroll up stops reading as a welcome.
 */
let greeted = false;

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

/**
 * One eye: a rim sunk into the face, a lit iris and pupil beneath a glossy dome,
 * and a catchlight on the dome — the highlight is what actually reads as an eye
 * rather than a glowing dot stuck on the front of the head.
 */
function Eye({
  position,
  quaternion,
  r,
  irisRef,
}: {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  r: number;
  irisRef: React.RefObject<THREE.MeshStandardMaterial | null>;
}) {
  return (
    <group position={position} quaternion={quaternion}>
      {/* rim, seated into the face */}
      <mesh position={[0, 0, -r * 0.12]}>
        <ringGeometry args={[r * 1.0, r * 1.22, 32]} />
        <meshStandardMaterial color="#212930" metalness={0.8} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* back of the socket, so the dome has something dark behind it */}
      <mesh position={[0, 0, -r * 0.05]}>
        <circleGeometry args={[r * 0.98, 28]} />
        <meshStandardMaterial color="#05090c" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* lit iris */}
      <mesh position={[0, 0, r * 0.04]}>
        <ringGeometry args={[r * 0.3, r * 0.86, 32]} />
        <meshStandardMaterial
          ref={irisRef}
          color="#2ec9ff"
          emissive="#14bfff"
          emissiveIntensity={2.2}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* pupil */}
      <mesh position={[0, 0, r * 0.07]}>
        <circleGeometry args={[r * 0.32, 24]} />
        <meshBasicMaterial color="#04080b" toneMapped={false} />
      </mesh>
      {/* glossy dome over it all */}
      <mesh scale={[1, 0.86, 0.52]}>
        <sphereGeometry args={[r, 24, 18]} />
        <meshStandardMaterial
          color="#0d161c"
          metalness={0.3}
          roughness={0.05}
          envMapIntensity={2.6}
          transparent
          opacity={0.22}
        />
      </mesh>
      {/* catchlight */}
      <mesh position={[-r * 0.31, r * 0.27, r * 0.5]}>
        <circleGeometry args={[r * 0.16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.92} />
      </mesh>
    </group>
  );
}

function Arm({
  arm,
  rig,
  material,
  shoulderRef,
  elbowRef,
  wristRef,
}: {
  arm: ArmSegments;
  rig: ReturnType<typeof buildRobotRig>;
  material: THREE.Material;
  shoulderRef: React.RefObject<THREE.Group | null>;
  elbowRef: React.RefObject<THREE.Group | null>;
  wristRef: React.RefObject<THREE.Group | null>;
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
          <group ref={wristRef} position={arm.wristOffset}>
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
  /** Fires once the model has resolved, so the poster can hand over cleanly. */
  onReady?: () => void;
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
export function RobotFull({ progress, pointer, click, onReady }: Props) {
  const { scene } = useGLTF(MODEL, false);
  const group = useRef<THREE.Group>(null);
  // One pair of joints per arm: index 0 is the arm on screen-left.
  const shoulderL = useRef<THREE.Group>(null);
  const elbowL = useRef<THREE.Group>(null);
  const shoulderR = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const wristL = useRef<THREE.Group>(null);
  const wristRt = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const irisA = useRef<THREE.MeshStandardMaterial>(null);
  const irisB = useRef<THREE.MeshStandardMaterial>(null);

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
    const pbox = new THREE.Box3().setFromObject(probe);
    const ph = pbox.max.y - pbox.min.y;
    const cx = (pbox.min.x + pbox.max.x) / 2;
    const ray = new THREE.Raycaster();
    const eyeY = pbox.min.y + EYE_HEIGHT * ph;
    const found: { position: [number, number, number]; quaternion: [number, number, number, number] }[] = [];
    for (const side of [-1, 1]) {
      ray.set(new THREE.Vector3(cx + side * EYE_SPREAD * ph, eyeY, ph), new THREE.Vector3(0, 0, -1));
      const hit = ray.intersectObject(probe, false)[0];
      if (!hit?.face) continue;
      const n = hit.face.normal.clone().normalize();
      if (n.z < 0) n.negate();
      const q = new THREE.Quaternion().setFromUnitVectors(FORWARD, n);
      // Sit the centre a hair proud; the head's curvature sinks the rim in.
      const out = ph * 0.0012;
      found.push({
        position: [hit.point.x + n.x * out, hit.point.y + n.y * out, hit.point.z + n.z * out],
        quaternion: [q.x, q.y, q.z, q.w],
      });
    }
    return { rig, material, eyes: found };
  }, [scene]);

  // This component only renders once useGLTF has resolved, so mounting is the
  // signal that there is something to look at.
  useEffect(() => onReady?.(), [onReady]);

  // Animation scratch kept in refs (not useMemo) so it is legitimately mutable
  // across frames without tripping the "don't mutate after render" rule.
  const arm = useRef({ seq: 0, start: -1, reach: 0, side: 0 as 0 | 1 });
  const greet = useRef({ start: -1, armed: !greeted });
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

    // ---- hello ----
    const v = vecs.current;
    const s = arm.current;
    const gr = greet.current;
    if (gr.armed && gr.start < 0) {
      gr.armed = false;
      greeted = true;
      gr.start = t + GREET_DELAY;
    }
    let greetAmt = 0;
    let swing = 0;
    if (gr.start >= 0 && t >= gr.start) {
      const e = t - gr.start;
      if (e < GREET_IN) {
        greetAmt = easeOutCubic(e / GREET_IN);
      } else if (e < GREET_IN + GREET_WAVE) {
        greetAmt = 1;
        swing = Math.sin((e - GREET_IN) * GREET_SWING);
      } else if (e < GREET_TOTAL) {
        greetAmt = 1 - easeInOutCubic((e - GREET_IN - GREET_WAVE) / GREET_OUT);
        // Let the swing die out rather than stopping dead as the arm drops.
        swing = Math.sin((e - GREET_IN) * GREET_SWING) * greetAmt;
      } else {
        gr.start = -1;
      }
    }

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

    // Look at the visitor while greeting them, rather than drifting.
    if (greetAmt > 0 && !ptr.moved) {
      lookX *= 1 - greetAmt;
      lookY *= 1 - greetAmt;
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

    // The iris breathes, with an occasional fast dip — a blink is the cheapest
    // cue that reads as alive rather than as a lamp left on.
    const phase = (t * 0.19) % 1;
    const blink = phase < 0.055 ? Math.sin((phase / 0.055) * Math.PI) : 0;
    const glow = Math.max(0.2, 2.2 + Math.sin(t * 1.3) * 0.35 - blink * 2.1);
    if (irisA.current) irisA.current.emissiveIntensity = glow;
    if (irisB.current) irisB.current.emissiveIntensity = glow;

    // ---- the near hand reaches out and taps whatever was clicked ----
    if (c && c.seq !== s.seq) {
      // A visitor who clicks has already been greeted; drop the wave mid-air.
      gr.start = -1;
      greetAmt = 0;
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
      if (i === GREET_ARM && greetAmt > 0) {
        // Hand up beside the head, swinging side to side. Placed off the arm's
        // own span so it stays inside its reach whatever the rig measures.
        const span = a.l1 + a.l2;
        const out = a.shoulder.x < 0 ? -1 : 1;
        v.tmp.set(
          a.shoulder.x + out * (GREET_OUT_X + swing * GREET_SWAY) * span,
          a.shoulder.y + GREET_UP * span,
          a.shoulder.z + GREET_FWD * span,
        );
        v.target.lerp(v.tmp, greetAmt * (1 - reach));
      }
      solveArmIK(a, v.target, v.q1, v.q2);
      const [sh, el] = joints[i];
      if (sh.current) sh.current.quaternion.slerp(v.q1, ik);
      if (el.current) el.current.quaternion.slerp(v.q2, ik);
    }

    if (ring.current) {
      // The ring is the press itself: it pops the instant the hand arrives, then
      // expands and fades. A link click opens its section just after this lands,
      // so the order reads reach → press → ripple → section.
      const since = s.start >= 0 ? t - s.start - REACH_IN : -1;
      const k = since >= 0 && since < RIPPLE ? since / RIPPLE : -1;
      ring.current.visible = k >= 0;
      if (k >= 0) {
        // Pinned to the hand, not to the raw click: the arm's reach is clamped,
        // so a far click leaves the two in different places otherwise.
        const wrist = (s.side === 0 ? wristL : wristRt).current;
        if (wrist) {
          wrist.getWorldPosition(v.tmp);
          g.worldToLocal(v.tmp);
          ring.current.position.copy(v.tmp);
        } else {
          ring.current.position.copy(v.hit);
        }
        ring.current.lookAt(state.camera.position);
        ring.current.scale.setScalar(0.45 + k * 1.15);
        (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9;
      }
    }
  });

  return (
    <group ref={group} position={[0, ROBOT_GROUND + HIP, 0]}>
      <mesh geometry={rig.body} material={material} castShadow />

      {/* Both of the robot's own arms, cut from the same mesh and hung on IK joints. */}
      <Arm arm={rig.arms[0]} rig={rig} material={material} shoulderRef={shoulderL} elbowRef={elbowL} wristRef={wristL} />
      <Arm arm={rig.arms[1]} rig={rig} material={material} shoulderRef={shoulderR} elbowRef={elbowR} wristRef={wristRt} />

      {eyes.map((e, i) => (
        <Eye
          key={e.position.join(",")}
          position={e.position}
          quaternion={e.quaternion}
          r={ROBOT_HEIGHT * EYE_R}
          irisRef={i === 0 ? irisA : irisB}
        />
      ))}
      {eyes.length > 0 ? (
        <pointLight
          position={[0, eyes[0].position[1], eyes[0].position[2] + 0.3]}
          color="#4ad9ff"
          intensity={1.4}
          distance={2.6}
          decay={2}
        />
      ) : null}

      {/* Tap ripple at the touch point. */}
      <mesh ref={ring} visible={false}>
        <ringGeometry args={[0.34, 0.42, 44]} />
        <meshBasicMaterial color="#4ad9ff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL, false);
