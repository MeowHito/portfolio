"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useScrollStore } from "@/lib/scroll";
import { Bird } from "./Bird";
import { Lights } from "./Lights";

/** frameloop="demand": render a frame whenever scroll state changes. */
function ScrollInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => useScrollStore.subscribe(() => invalidate()), [invalidate]);
  return null;
}

/**
 * One fixed, full-screen, transparent canvas mounted at the page root so the
 * bird can travel across sections without remounting (and survives EN ⇄ TH).
 */
export default function BirdScene() {
  const [dprMax, setDprMax] = useState(1.5);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      <Canvas
        dpr={[1, dprMax]}
        frameloop="demand"
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 35, position: [0, 0, 10], near: 0.1, far: 100 }}
        // R3F sets pointer-events: auto on its wrapper; the bird must never block clicks.
        style={{ pointerEvents: "none" }}
      >
        {/* If fps drops, cap the pixel ratio at 1. */}
        <PerformanceMonitor onDecline={() => setDprMax(1)} />
        <ScrollInvalidator />
        <Lights />
        <Bird />
      </Canvas>
    </div>
  );
}
