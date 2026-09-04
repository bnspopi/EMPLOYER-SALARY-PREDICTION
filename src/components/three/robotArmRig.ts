import * as THREE from "three";

/**
 * Splits the robot's own arms out of its body mesh so they can be posed.
 *
 * The reconstruction is a single welded shell — one connected component, no
 * skeleton — so there is no arm to move and nothing to hide. Both arms are
 * instead cut out of the geometry by triangle, into upper arm / forearm / hand,
 * and re-parented into shoulder→elbow→wrist hierarchies that two-bone IK can
 * drive. Each cut leaves an open stump, capped with a ball joint — matching the
 * dark joints the model already carries at its elbows and knees.
 *
 * All constants below are in "height units": the geometry's own space divided by
 * its standing height and centred on its bounding box, so they stay valid at
 * whatever scale the model is rendered, and whether or not the source GLB was
 * quantized.
 */

/**
 * Inboard edge of the arm, as x at a given height, for the arm at negative x.
 * The figure stands in a slight A-pose, so the gap between arm and torso moves
 * outboard going down; a single vertical plane would slice the shoulder off or
 * leave the forearm attached. Sampled from the mesh's own x-histogram per
 * horizontal slice, and mirrored for the other arm — the figure is symmetric to
 * within a bin at every height sampled.
 */
const BOUNDARY: [number, number][] = [
  [0.30, -0.052],
  [0.25, -0.062],
  [0.17, -0.075],
  [0.125, -0.082],
  [0.083, -0.100],
  [0.0, -0.115],
  [-0.08, -0.120],
  [-0.20, -0.122],
];

/** Vertical extent of the arms: shoulder down to fingertips. */
const ARM_TOP = 0.30;
const ARM_BOTTOM = -0.175;

/** Joint centres for the arm at negative x, in height units. */
const SHOULDER = new THREE.Vector3(-0.088, 0.272, 0.0);
const ELBOW = new THREE.Vector3(-0.134, 0.062, 0.006);
const WRIST = new THREE.Vector3(-0.15, -0.052, 0.006);

/**
 * Ball-joint radii in height units. Measuring these off the mesh does not work:
 * the widest point near the shoulder is the deltoid, not the limb, so a probe
 * returns a sphere that swallows the torso. The arm is ~0.02 of standing height
 * in radius, and each cap is set just proud of the limb it closes. The torso
 * keeps its own, wider socket: the ball travels with the arm, so once the arm
 * lifts it stops covering the opening the cut left behind.
 */
const SHOULDER_R = 0.028;
const SOCKET_R = 0.034;
const ELBOW_R = 0.019;
const WRIST_R = 0.014;

function boundaryAt(y: number): number {
  if (y >= BOUNDARY[0][0]) return BOUNDARY[0][1];
  for (let i = 1; i < BOUNDARY.length; i++) {
    const [y1, x1] = BOUNDARY[i];
    if (y >= y1) {
      const [y0, x0] = BOUNDARY[i - 1];
      return x1 + (x0 - x1) * ((y - y1) / (y0 - y1));
    }
  }
  return BOUNDARY[BOUNDARY.length - 1][1];
}

/** One posable arm. Geometries are pre-translated so each joint sits at its own origin. */
export interface ArmSegments {
  upper: THREE.BufferGeometry;
  fore: THREE.BufferGeometry;
  hand: THREE.BufferGeometry;
  /** Shoulder in model space; elbow relative to shoulder; wrist relative to elbow. */
  shoulder: THREE.Vector3;
  elbowOffset: THREE.Vector3;
  wristOffset: THREE.Vector3;
  l1: number;
  l2: number;
  upperDir: THREE.Vector3;
  foreDir: THREE.Vector3;
  /** Which way the elbow folds, so it never hyperextends outward. */
  bend: number;
  /** Where the hand parks, in model space. */
  restWrist: THREE.Vector3;
}

export interface RobotRig {
  /** Everything that is not a posable arm. */
  body: THREE.BufferGeometry;
  /** Index 0 is the arm on screen-left (negative x), index 1 the one on screen-right. */
  arms: [ArmSegments, ArmSegments];
  shoulderR: number;
  socketR: number;
  elbowR: number;
  wristR: number;
}

type Bucket = { pos: number[]; nrm: number[]; uv: number[] };
const bucket = (): Bucket => ({ pos: [], nrm: [], uv: [] });

function build(b: Bucket, origin?: THREE.Vector3): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const pos = Float32Array.from(b.pos);
  if (origin) {
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] -= origin.x;
      pos[i + 1] -= origin.y;
      pos[i + 2] -= origin.z;
    }
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  if (b.nrm.length) g.setAttribute("normal", new THREE.BufferAttribute(Float32Array.from(b.nrm), 3));
  if (b.uv.length) g.setAttribute("uv", new THREE.BufferAttribute(Float32Array.from(b.uv), 2));
  g.computeBoundingSphere();
  return g;
}

/**
 * `geometry` must already be baked into the space it will render in (scale and
 * offset applied), so the rig it returns needs no further transform.
 */
export function buildRobotRig(geometry: THREE.BufferGeometry): RobotRig {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  const centre = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(centre);
  const h = size.y || 1;
  /** Height units → the geometry's own space, mirrored in x for the right arm. */
  const toModel = (u: THREE.Vector3, mirror: boolean) =>
    new THREE.Vector3((mirror ? -u.x : u.x) * h, u.y * h, u.z * h).add(centre);

  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  const index = geometry.getIndex();
  const triCount = index ? index.count / 3 : position.count / 3;
  const vi = (t: number, c: number) => (index ? index.getX(t * 3 + c) : t * 3 + c);

  const body = bucket();
  // [screen-left, screen-right] × [upper, fore, hand]
  const seg: Bucket[][] = [
    [bucket(), bucket(), bucket()],
    [bucket(), bucket(), bucket()],
  ];

  const p = new THREE.Vector3();
  const cen = new THREE.Vector3();

  for (let t = 0; t < triCount; t++) {
    const a = vi(t, 0);
    const b2 = vi(t, 1);
    const c = vi(t, 2);
    cen.set(0, 0, 0);
    for (const k of [a, b2, c]) {
      p.fromBufferAttribute(position, k);
      cen.add(p);
    }
    cen.multiplyScalar(1 / 3);
    const ux = (cen.x - centre.x) / h;
    const uy = (cen.y - centre.y) / h;

    let target = body;
    if (uy > ARM_BOTTOM && uy < ARM_TOP) {
      const edge = boundaryAt(uy);
      const side = ux < edge ? 0 : ux > -edge ? 1 : -1;
      if (side >= 0) target = seg[side][uy > ELBOW.y ? 0 : uy > WRIST.y ? 1 : 2];
    }

    for (const k of [a, b2, c]) {
      p.fromBufferAttribute(position, k);
      target.pos.push(p.x, p.y, p.z);
      if (normal) {
        p.fromBufferAttribute(normal, k);
        target.nrm.push(p.x, p.y, p.z);
      }
      if (uv) target.uv.push(uv.getX(k), uv.getY(k));
    }
  }

  const makeArm = (i: 0 | 1): ArmSegments => {
    const mirror = i === 1;
    const S = toModel(SHOULDER, mirror);
    const E = toModel(ELBOW, mirror);
    const W = toModel(WRIST, mirror);
    return {
      upper: build(seg[i][0], S),
      fore: build(seg[i][1], E),
      hand: build(seg[i][2], W),
      shoulder: S,
      elbowOffset: E.clone().sub(S),
      wristOffset: W.clone().sub(E),
      l1: E.distanceTo(S),
      l2: W.distanceTo(E),
      upperDir: E.clone().sub(S).normalize(),
      foreDir: W.clone().sub(E).normalize(),
      bend: mirror ? -1 : 1,
      restWrist: W.clone(),
    };
  };

  return {
    body: build(body),
    arms: [makeArm(0), makeArm(1)],
    shoulderR: SHOULDER_R * h,
    socketR: SOCKET_R * h,
    elbowR: ELBOW_R * h,
    wristR: WRIST_R * h,
  };
}

const _v = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _up = new THREE.Vector3();
const _elbow = new THREE.Vector3();
const _fore = new THREE.Vector3();
const _inv = new THREE.Quaternion();
const POLE = new THREE.Vector3(0, 0, 1);

/**
 * Two-bone IK in the rig's own space. Writes the shoulder and elbow rotations
 * that put the wrist on `target`, clamped into the arm's real reach — the robot
 * leans toward a far click and taps as close to it as its arm allows, rather
 * than stretching to meet it.
 */
export function solveArmIK(arm: ArmSegments, target: THREE.Vector3, q1: THREE.Quaternion, q2: THREE.Quaternion) {
  const { l1, l2 } = arm;
  _v.copy(target).sub(arm.shoulder);
  if (_v.lengthSq() < 1e-8) _v.copy(arm.upperDir);
  const dist = THREE.MathUtils.clamp(_v.length(), Math.abs(l1 - l2) + 0.02, l1 + l2 - 0.02);
  _dir.copy(_v).normalize();

  const alpha = Math.acos(THREE.MathUtils.clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1));
  _axis.copy(_dir).cross(POLE);
  if (_axis.lengthSq() < 1e-6) _axis.set(1, 0, 0);
  _axis.normalize();

  _up.copy(_dir).applyAxisAngle(_axis, alpha * arm.bend);
  q1.setFromUnitVectors(arm.upperDir, _up);

  _elbow.copy(arm.shoulder).addScaledVector(_up, l1);
  _fore.copy(arm.shoulder).addScaledVector(_dir, dist).sub(_elbow).normalize();
  _inv.copy(q1).invert();
  _fore.applyQuaternion(_inv);
  q2.setFromUnitVectors(arm.foreDir, _fore);
}
