"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ClickTarget } from "@/hooks/useClickTarget";

/** Distance in front of the robot where the "screen" the robot taps sits. */
const PLANE_Z = 1.55;
/** Upper-arm and forearm lengths. */
const L1 = 1.05;
const L2 = 1.0;
/** Where the hand parks when idle — tucked down and behind the shoulder. */
const REST = new THREE.Vector3(-1.5, -1.15, -0.55);
const SHOULDER = new THREE.Vector3(-1.28, -0.12, -0.28);

const REACH_IN = 0.3; // s — time to extend
const HOLD = 0.16; // s — tap dwell
const REACH_OUT = 0.55; // s — retract

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const chrome = { color: "#c9ced6", metalness: 1, roughness: 0.28 };
const joint = { color: "#7d848f", metalness: 1, roughness: 0.4 };

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
          <sphereGeometry args={[0.19, 24, 24]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <group ref={upper}>
          {/* upper arm along +Z */}
          <mesh position={[0, 0, L1 / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, L1 - 0.2, 8, 16]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
          <group ref={fore} position={[0, 0, L1]}>
            {/* elbow */}
            <mesh>
              <sphereGeometry args={[0.13, 20, 20]} />
              <meshStandardMaterial {...joint} />
            </mesh>
            {/* forearm along +Z */}
            <mesh position={[0, 0, L2 / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.085, L2 - 0.24, 8, 16]} />
              <meshStandardMaterial {...chrome} />
            </mesh>
            {/* hand: palm + a pointing index finger + folded fingers */}
            <group position={[0, 0, L2]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.17, 0.12, 0.2]} />
                <meshStandardMaterial {...chrome} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.032, 0.16, 6, 12]} />
                <meshStandardMaterial {...chrome} roughness={0.3} />
              </mesh>
              {/* glowing fingertip */}
              <mesh position={[0, 0, 0.26]}>
                <sphereGeometry args={[0.042, 16, 16]} />
                <meshStandardMaterial ref={tip} color="#4ad9ff" emissive="#4ad9ff" emissiveIntensity={2} toneMapped={false} />
              </mesh>
              {[-0.055, 0.055].map((x) => (
                <mesh key={x} position={[x, -0.075, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
                  <capsuleGeometry args={[0.022, 0.08, 4, 8]} />
                  <meshStandardMaterial {...joint} />
                </mesh>
              ))}
            </group>
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
