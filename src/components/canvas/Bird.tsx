"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  DoubleSide,
  FrontSide,
  MathUtils,
  Shape,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import { useScrollStore } from "@/lib/scroll";
import { birdColors, colors } from "@/lib/tokens";
import { aboutPose, heroPose, makeEntryCurve, projectsPose, type Point, type Pose } from "./choreography";

/** Model length (tail tip → beak tip) in model units; used to size the bird in px. */
const MODEL_LENGTH = 1.95;
/** Eagles flap slow and deep: every pose's flap frequency is scaled by this. */
const TEMPO = 0.4;
/** Span of the inner (arm) wing panel; the hand panel hinges here. */
const ARM_SPAN = 0.62;
/** Feet sit at y = 0; the body floats this far above. */
const BODY_Y = 0.42;
const damp = MathUtils.damp;

/* ---------------- geometry (procedural, low-poly, paper-craft) ---------------- */

/** Inner wing (arm) outline in the XY plane (x = along body, y = span); rotated into XZ. */
function armShape() {
  const s = new Shape();
  s.moveTo(0.16, 0);
  s.lineTo(0.18, 0.3);
  s.lineTo(0.14, ARM_SPAN);
  s.lineTo(-0.28, ARM_SPAN);
  s.lineTo(-0.36, 0.32);
  s.lineTo(-0.28, 0);
  s.closePath();
  return s;
}

/** Outer wing (hand) with five splayed primaries — the eagle's "fingers". */
function handShape() {
  const s = new Shape();
  s.moveTo(0.14, 0);
  s.lineTo(0.12, 0.34);
  s.lineTo(0.04, 0.6);
  s.lineTo(-0.0, 0.78);
  s.lineTo(-0.06, 0.6);
  s.lineTo(-0.09, 0.77);
  s.lineTo(-0.13, 0.57);
  s.lineTo(-0.17, 0.72);
  s.lineTo(-0.2, 0.53);
  s.lineTo(-0.25, 0.64);
  s.lineTo(-0.26, 0.47);
  s.lineTo(-0.31, 0.54);
  s.lineTo(-0.3, 0.3);
  s.lineTo(-0.28, 0);
  s.closePath();
  return s;
}

/** Wedge-shaped white tail. */
function tailShape() {
  const s = new Shape();
  s.moveTo(0, 0.1);
  s.lineTo(-0.4, 0.2);
  s.lineTo(-0.46, 0.07);
  s.lineTo(-0.47, -0.07);
  s.lineTo(-0.4, -0.2);
  s.lineTo(0, -0.1);
  s.closePath();
  return s;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

const paper = { roughness: 0.9, metalness: 0, flatShading: true } as const;

/** One wing panel: brown on top, lighter underneath (two faces of one shape). */
function WingPanel({ shape, top = birdColors.wingTop }: { shape: Shape; top?: string }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={top} side={BackSide} {...paper} />
      </mesh>
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={birdColors.wingUnder} side={FrontSide} {...paper} />
      </mesh>
    </group>
  );
}

/** Arm + hand; the hand hinges at the wrist so the tip trails each stroke. */
function Wing({
  arm,
  hand,
  handRef,
}: {
  arm: Shape;
  hand: Shape;
  handRef: RefObject<Group | null>;
}) {
  return (
    <>
      <WingPanel shape={arm} />
      <group ref={handRef} position={[0, 0, ARM_SPAN]}>
        <WingPanel shape={hand} top={birdColors.primaries} />
      </group>
    </>
  );
}

/* ---------------- component ---------------- */

export function Bird() {
  const { size, viewport, invalidate } = useThree();
  const perchPx = useScrollStore((s) => s.perch);
  const mobile = size.width < 768;

  const root = useRef<Group>(null);
  const tiltG = useRef<Group>(null);
  const yawG = useRef<Group>(null);
  const bankG = useRef<Group>(null);
  const head = useRef<Group>(null);
  const wingL = useRef<Group>(null);
  const wingR = useRef<Group>(null);
  const handL = useRef<Group>(null);
  const handR = useRef<Group>(null);
  const legs = useRef<Group>(null);
  const glow = useRef<Mesh>(null);

  const arm = useMemo(armShape, []);
  const hand = useMemo(handShape, []);
  const tail = useMemo(tailShape, []);
  const glowTex = useMemo(glowTexture, []);
  useEffect(() => () => glowTex.dispose(), [glowTex]);

  // Perch in normalized viewport coords (fallback before the Hero measures).
  const perch: Point = useMemo(
    () =>
      perchPx
        ? { x: perchPx.x / size.width - 0.5, y: 0.5 - perchPx.y / size.height }
        : { x: 0.28, y: -0.02 },
    [perchPx, size.width, size.height],
  );
  const curve = useMemo(() => makeEntryCurve(perch, mobile), [perch, mobile]);

  // Smoothed state — the bird eases toward each target pose (feels physical).
  const s = useRef({
    x: 0.7, y: 0.18, scale: 0.6, amp: 0.9, fold: 0, glow: 0, bank: 0,
    phase: 0, sink: 0, yaw: Math.PI + 0.35, facing: -1, lastX: 0.7, lastY: 0.18, look: 0,
    flapBoost: 0, breathe: 0, glide: 0,
  });

  useEffect(() => invalidate(), [perch, invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    const { progress, velocity } = useScrollStore.getState();
    const st = s.current;

    // Which stage owns the bird right now (stages hand off continuously).
    let pose: Pose;
    if (progress.projects > 0) pose = projectsPose(progress.projects);
    else if (progress.about > 0) pose = aboutPose(progress.about);
    else pose = heroPose(progress.hero, perch, curve);

    const g = root.current!;
    g.visible = pose.visible;
    glow.current!.visible = pose.glow > 0.01;
    if (!pose.visible) return; // stop rendering: frameloop is "demand"

    // About: flap only while the visitor scrolls fast; otherwise glide + sink 10px.
    let amp = pose.amp;
    let sinkTarget = 0;
    if (pose.velocityFlap) {
      const fast = Math.abs(velocity) > 1.2;
      st.flapBoost = damp(st.flapBoost, fast ? 1 : 0, 4, dt);
      amp = 0.85 * st.flapBoost;
      sinkTarget = fast ? 0 : 10 / size.height;
    }
    st.sink = damp(st.sink, sinkTarget, 1.2, dt);

    const k = 7; // follow stiffness
    st.x = damp(st.x, pose.x, k, dt);
    st.y = damp(st.y, pose.y - st.sink, k, dt);
    st.scale = damp(st.scale, pose.scale, 5, dt);
    // Cruising: every few strokes, hold the wings out and soar for a beat.
    const cruising = !pose.velocityFlap && !pose.resting && pose.freq <= 3;
    const soar = cruising && Math.sin(t * 0.55) > 0.35;
    st.glide = damp(st.glide, soar ? 1 : 0, 1.5, dt);
    amp *= 1 - 0.88 * st.glide;
    st.amp = damp(st.amp, amp, 2.5, dt);
    st.fold = damp(st.fold, pose.fold, 10, dt); // ~0.3s settle
    st.glow = damp(st.glow, pose.glow, 6, dt);
    st.bank = damp(st.bank, pose.bank, 4, dt);

    // Face the direction of travel, turned toward the camera. In flight it
    // turns further and tips its back up so the full wingspan reads.
    const dx = st.x - st.lastX;
    const dyv = st.y - st.lastY;
    st.lastX = st.x;
    st.lastY = st.y;
    if (Math.abs(dx) > 0.0004) st.facing = dx < 0 ? -1 : 1;
    const turn = 0.35 + 0.45 * (1 - st.fold);
    const yawTarget = st.facing < 0 ? Math.PI + turn : -turn;
    tiltG.current!.rotation.x = 0.28 + 0.3 * (1 - st.fold);
    st.yaw = damp(st.yaw, yawTarget, 4, dt);

    // Flap: slow, deep strokes about the body axis; the hand lags the arm
    // so the primaries trail on the way down and whip through at the bottom.
    st.phase += dt * Math.PI * 2 * pose.freq * TEMPO;
    const open = 1 - st.fold;
    const flap = Math.sin(st.phase) * st.amp + 0.1 * open;
    const handFlap = (Math.sin(st.phase - 0.9) * st.amp * 0.6 + 0.08) * open;
    const fold = st.fold;
    wingL.current!.rotation.set(-flap * open + 0.35 * fold, -1.25 * fold, 0);
    wingR.current!.rotation.set(flap * open - 0.35 * fold, 1.25 * fold, 0);
    handL.current!.rotation.set(-handFlap, -0.35 * fold, 0);
    handR.current!.rotation.set(-handFlap, -0.35 * fold, 0);

    // Body lifts on each downstroke, banking, slight nose-up when climbing.
    const bob = -Math.cos(st.phase) * st.amp * 0.06;
    bankG.current!.rotation.set(
      st.bank * st.facing,
      0,
      MathUtils.clamp(dyv * 30, -0.3, 0.3) + Math.cos(st.phase) * st.amp * 0.04,
    );
    yawG.current!.rotation.y = st.yaw;
    yawG.current!.position.y = bob;

    // Resting: 0.5 Hz breathing + small two-step look-around (±15°).
    st.breathe = pose.resting ? 1 + 0.0075 * (1 + Math.sin(t * Math.PI)) : 1;
    const lookTarget = pose.resting ? (Math.sin(t * 0.9) > 0 ? 0.26 : -0.26) : 0;
    st.look = damp(st.look, lookTarget, 8, dt);
    head.current!.rotation.y = st.look;
    legs.current!.scale.y = Math.max(0.001, fold);

    // Normalized → world (camera looks at the z = 0 plane).
    const worldPerPx = viewport.width / size.width;
    const lengthPx = MathUtils.clamp(size.width * 0.1, 76, 170) * (mobile ? 0.6 : 1);
    const unit = (lengthPx * worldPerPx) / MODEL_LENGTH;
    g.position.set(st.x * viewport.width, st.y * viewport.height, 0);
    g.scale.setScalar(unit * st.scale * st.breathe);

    // Soft glow under the feet on the perch.
    const gm = glow.current!;
    gm.position.set(perch.x * viewport.width, perch.y * viewport.height, -0.01);
    gm.scale.set(unit * 1.6, unit * 0.45, 1);
    (gm.material as MeshBasicMaterial).opacity = st.glow * 0.55;

    invalidate(); // keep animating while visible
  });

  return (
    <>
      <mesh ref={glow} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTex}
          color={colors.glow}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          opacity={0}
        />
      </mesh>

      <group ref={root} visible={false}>
        {/* tilt so the back is slightly visible from the front camera */}
        <group ref={tiltG} rotation={[0.28, 0, 0]}>
          <group ref={yawG}>
            <group ref={bankG} position={[0, BODY_Y, 0]}>
              {/* body + chest */}
              <mesh scale={[1.2, 0.6, 0.6]}>
                <sphereGeometry args={[0.5, 8, 6]} />
                <meshStandardMaterial color={birdColors.body} {...paper} />
              </mesh>
              <mesh position={[0.18, -0.04, 0]} scale={[0.7, 0.56, 0.58]}>
                <sphereGeometry args={[0.5, 8, 6]} />
                <meshStandardMaterial color={birdColors.body} {...paper} />
              </mesh>

              {/* white neck hood */}
              <mesh position={[0.44, 0.1, 0]} scale={[1.1, 0.95, 0.95]}>
                <sphereGeometry args={[0.2, 7, 5]} />
                <meshStandardMaterial color={birdColors.white} {...paper} />
              </mesh>

              {/* head, hooked beak, brow, eyes */}
              <group ref={head} position={[0.6, 0.18, 0]}>
                <mesh scale={[1.2, 0.95, 0.9]}>
                  <sphereGeometry args={[0.19, 7, 5]} />
                  <meshStandardMaterial color={birdColors.white} {...paper} />
                </mesh>
                <mesh position={[0.29, -0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.075, 0.22, 4]} />
                  <meshStandardMaterial color={birdColors.beak} {...paper} />
                </mesh>
                <mesh position={[0.37, -0.07, 0]} rotation={[0, 0, Math.PI - 0.5]}>
                  <coneGeometry args={[0.028, 0.09, 4]} />
                  <meshStandardMaterial color={birdColors.beak} {...paper} />
                </mesh>
                {[-1, 1].map((side) => (
                  <group key={side} position={[0.12, 0.05, 0.13 * side]}>
                    <mesh>
                      <sphereGeometry args={[0.032, 6, 4]} />
                      <meshStandardMaterial color={birdColors.eye} roughness={0.4} />
                    </mesh>
                    {/* heavy brow = the eagle's stern look */}
                    <mesh position={[0.01, 0.04, 0.012 * side]} rotation={[0, 0, -0.35]}>
                      <boxGeometry args={[0.11, 0.026, 0.05]} />
                      <meshStandardMaterial color={birdColors.white} {...paper} />
                    </mesh>
                  </group>
                ))}
              </group>

              {/* white wedge tail */}
              <mesh position={[-0.52, 0.04, 0]} rotation={[Math.PI / 2, 0.12, 0]}>
                <shapeGeometry args={[tail]} />
                <meshStandardMaterial color={birdColors.white} side={DoubleSide} {...paper} />
              </mesh>

              {/* wings pivot at the shoulders */}
              <group ref={wingL} position={[0.1, 0.12, 0.14]}>
                <Wing arm={arm} hand={hand} handRef={handL} />
              </group>
              <group ref={wingR} position={[0.1, 0.12, -0.14]} scale={[1, 1, -1]}>
                <Wing arm={arm} hand={hand} handRef={handR} />
              </group>

              {/* feathered legs + yellow talons (only when perched) */}
              <group ref={legs} position={[0.04, -0.26, 0]}>
                {[-1, 1].map((side) => (
                  <group key={side} position={[0, 0, 0.09 * side]}>
                    <mesh position={[0, 0.02, 0]} scale={[1, 1.3, 1]}>
                      <sphereGeometry args={[0.08, 6, 4]} />
                      <meshStandardMaterial color={birdColors.body} {...paper} />
                    </mesh>
                    <mesh position={[0, -0.1, 0]}>
                      <cylinderGeometry args={[0.024, 0.024, 0.12, 5]} />
                      <meshStandardMaterial color={birdColors.beak} {...paper} />
                    </mesh>
                    {[-0.35, 0, 0.35].map((spread) => (
                      <mesh key={spread} position={[0.04, -0.15, spread * 0.06]} rotation={[0, -spread, -Math.PI / 2 - 0.4]}>
                        <coneGeometry args={[0.014, 0.08, 4]} />
                        <meshStandardMaterial color={birdColors.eye} {...paper} />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
