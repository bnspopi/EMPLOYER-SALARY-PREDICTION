"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ClickTarget } from "@/hooks/useClickTarget";

/** Distance in front of the robot where the "screen" the robot taps sits. */
const PLANE_Z = 1.9;
/** Upper-arm and forearm lengths — long, as a reaching robot arm would be. */
const L1 = 2.6;
const L2 = 2.45;
/** The arm grows out of the body's right shoulder cap (see <RobotBody />). */
const SHOULDER = new THREE.Vector3(-1.39, -1.16, 0.12);
/** Where the hand parks when idle — down at the robot's side. */
const REST = new THREE.Vector3(-1.85, -4.1, 0.3);

const REACH_IN = 0.3; // s — time to extend
const HOLD = 0.16; // s — tap dwell
const REACH_OUT = 0.55; // s — retract

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const chrome = { color: "#c9ced6", metalness: 1, roughness: 0.28 };
const joint = { color: "#7d848f", metalness: 1, roughness: 0.4 };


const skin = { color: "#b9bfc8", metalness: 0.95, roughness: 0.34 };
const knuckle = { color: "#6c737e", metalness: 1, roughness: 0.42 };

interface FingerProps {
  /** knuckle position on the palm, in palm space */
  position: [number, number, number];
  /** length scale — the middle finger is longest, the little finger shortest */
  len: number;
  /** 0 = straight, 1 = fully curled into the palm */
  curl: number;
  /** splay away from the middle axis */
  splay?: number;
  radius?: number;
}

/**
 * One finger: three phalanges (proximal, middle, distal) hinged at the knuckle,
 * PIP and DIP joints, each joint capped with a darker pivot so the articulation
 * reads at a glance. Built along +Z.
 */
function Finger({ position, len, curl, splay = 0, radius = 0.026 }: FingerProps) {
  const p1 = 0.115 * len;
  const p2 = 0.075 * len;
  const p3 = 0.055 * len;
  return (
    <group position={position} rotation={[curl * 1.35, splay, 0]}>
      <mesh>
        <sphereGeometry args={[radius * 1.28, 14, 14]} />
        <meshStandardMaterial {...knuckle} />
      </mesh>
      <mesh position={[0, 0, p1 / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[radius, p1 - radius, 5, 10]} />
        <meshStandardMaterial {...skin} />
      </mesh>
      {/* PIP */}
      <group position={[0, 0, p1]} rotation={[curl * 1.5, 0, 0]}>
        <mesh>
          <sphereGeometry args={[radius * 1.1, 12, 12]} />
          <meshStandardMaterial {...knuckle} />
        </mesh>
        <mesh position={[0, 0, p2 / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[radius * 0.9, p2 - radius, 5, 10]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* DIP + fingertip */}
        <group position={[0, 0, p2]} rotation={[curl * 1.2, 0, 0]}>
          <mesh>
            <sphereGeometry args={[radius * 0.95, 12, 12]} />
            <meshStandardMaterial {...knuckle} />
          </mesh>
          <mesh position={[0, 0, p3 / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[radius * 0.8, p3 - radius * 0.8, 5, 10]} />
            <meshStandardMaterial {...skin} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * An articulated hand: wrist, tapered palm with a visible knuckle ridge, four
 * three-jointed fingers and an opposed two-jointed thumb. The index points
 * forward to press; the remaining fingers curl into the palm the way a hand
 * actually does when you tap something.
 */
function Hand({ tipRef }: { tipRef: React.RefObject<THREE.MeshStandardMaterial | null> }) {
  return (
    <group position={[0, 0, L2]} scale={1.5}>
      {/* wrist pivot */}
      <mesh>
        <sphereGeometry args={[0.062, 18, 18]} />
        <meshStandardMaterial {...knuckle} />
      </mesh>
      {/* palm — tapered, thinner than it is wide, like the back of a hand */}
      <mesh position={[0, 0, 0.075]} scale={[1, 0.46, 1]}>
        <sphereGeometry args={[0.088, 22, 18]} />
        <meshStandardMaterial {...skin} roughness={0.4} />
      </mesh>
      {/* knuckle ridge across the top of the palm */}
      <mesh position={[0, 0.018, 0.13]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.42]}>
        <cylinderGeometry args={[0.052, 0.052, 0.13, 16]} />
        <meshStandardMaterial {...skin} roughness={0.45} />
      </mesh>

      {/* index — extended to press */}
      <Finger position={[-0.048, 0.006, 0.15]} len={1.06} curl={0.04} splay={-0.06} />
      {/* middle, ring, little — curled into the palm */}
      <Finger position={[-0.014, 0.012, 0.152]} len={1.12} curl={0.82} splay={-0.015} />
      <Finger position={[0.019, 0.008, 0.148]} len={1.0} curl={0.9} splay={0.03} radius={0.024} />
      <Finger position={[0.05, 0, 0.138]} len={0.84} curl={0.96} splay={0.08} radius={0.021} />
      {/* thumb — opposed, across the palm */}
      <group rotation={[0.25, 0.95, 0]}>
        <Finger position={[-0.07, -0.022, 0.055]} len={0.86} curl={0.34} radius={0.028} />
      </group>

      {/* the press point glows at the index fingertip */}
      <mesh position={[-0.052, 0.02, 0.4]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial ref={tipRef} color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * A chrome robot arm that reaches out of the scene and taps whatever the visitor
 * clicks in the hero — as if pressing the button for them from behind the screen.
 *
 * Two-bone IK: the shoulder aims its +Z at the hand target, then the upper arm and
 * forearm bend by the law of cosines so the fingertip lands exactly on the target.
 */
export function RobotArm({ click }: { click: React.MutableRefObject<ClickTarget> }) {
  const shoulder = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  const fore = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const tip = useRef<THREE.MeshStandardMaterial>(null);

  const state = useRef({ seq: 0, start: -1, reach: 0 });
  // Scratch vectors kept in a ref (not useMemo) so they are legitimately mutable
  // across frames without tripping the "don't mutate after render" rule.
  const vecs = useRef({
    hit: new THREE.Vector3(),
    hand: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    tmp: new THREE.Vector3(),
  });

  useFrame(({ camera, clock }, delta) => {
    const v = vecs.current;
    const s = state.current;
    const c = click.current;

    // A new click starts a fresh reach.
    if (c.seq !== s.seq) {
      s.seq = c.seq;
      s.start = clock.elapsedTime;
      // Project the click (NDC) onto the tap plane in front of the robot.
      v.tmp.set(c.x, c.y, 0.5).unproject(camera);
      v.dir.copy(v.tmp).sub(camera.position).normalize();
      const t = Math.abs(v.dir.z) < 1e-4 ? 0 : (PLANE_Z - camera.position.z) / v.dir.z;
      v.hit.copy(camera.position).addScaledVector(v.dir, t);
      // Keep the tap inside a believable reach envelope around the head.
      v.hit.x = THREE.MathUtils.clamp(v.hit.x, -1.5, 1.5);
      v.hit.y = THREE.MathUtils.clamp(v.hit.y, -1.2, 1.3);
    }

    // Drive the reach envelope: extend → hold (with a small poke) → retract.
    let poke = 0;
    if (s.start >= 0) {
      const e = clock.elapsedTime - s.start;
      if (e < REACH_IN) {
        s.reach = easeOutCubic(e / REACH_IN);
      } else if (e < REACH_IN + HOLD) {
        s.reach = 1;
        poke = Math.sin(((e - REACH_IN) / HOLD) * Math.PI) * 0.14;
      } else if (e < REACH_IN + HOLD + REACH_OUT) {
        s.reach = 1 - easeInOutCubic((e - REACH_IN - HOLD) / REACH_OUT);
      } else {
        s.reach = 0;
        s.start = -1;
      }
    }

    // Hand target: rest pose → clicked point, plus the forward poke at the peak.
    v.hand.copy(REST).lerp(v.hit, s.reach);
    v.hand.z += poke;
    // Idle sway so the parked arm never looks frozen.
    if (s.reach < 0.02) v.hand.y += Math.sin(clock.elapsedTime * 0.9) * 0.03;

    const sh = shoulder.current;
    const up = upper.current;
    const fa = fore.current;
    if (!sh || !up || !fa) return;

    sh.lookAt(v.hand);
    const d = THREE.MathUtils.clamp(v.tmp.copy(v.hand).sub(SHOULDER).length(), 0.35, L1 + L2 - 0.02);
    // Law of cosines → shoulder lift (a) and elbow bend (b).
    const a = Math.acos(THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const inner = Math.acos(THREE.MathUtils.clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    const k = 1 - Math.pow(0.0001, delta);
    up.rotation.x += (-a - up.rotation.x) * k;
    fa.rotation.x += (Math.PI - inner - fa.rotation.x) * k;

    // Tap feedback: a cyan ring that flashes at the touch point.
    if (ring.current) {
      ring.current.position.copy(v.hit);
      const vis = s.reach > 0.55 ? (s.reach - 0.55) / 0.45 : 0;
      ring.current.visible = vis > 0.01;
      ring.current.scale.setScalar(0.6 + (1 - vis) * 0.9);
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.opacity = vis * 0.75;
    }
    if (tip.current) tip.current.emissiveIntensity = 1.5 + s.reach * 6;
  });

  return (
    <>
      <group ref={shoulder} position={SHOULDER.toArray()}>
        {/* shoulder ball */}
        <mesh>
          <sphereGeometry args={[0.27, 24, 24]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <group ref={upper}>
          {/* upper arm along +Z */}
          <mesh position={[0, 0, L1 / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.15, L1 - 0.34, 8, 16]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          <group ref={fore} position={[0, 0, L1]}>
            {/* elbow */}
            <mesh>
              <sphereGeometry args={[0.19, 20, 20]} />
              <meshStandardMaterial {...joint} />
            </mesh>
            {/* forearm along +Z */}
            <mesh position={[0, 0, L2 / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.13, L2 - 0.36, 8, 16]} />
              <meshStandardMaterial {...chrome} />
            </mesh>
            {/* hand */}
            <Hand tipRef={tip} />
          </group>
        </group>
      </group>

      {/* tap ripple at the touch point */}
      <mesh ref={ring} visible={false} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.16, 0.2, 40]} />
        <meshBasicMaterial color="#4ad9ff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}
