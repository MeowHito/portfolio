"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Key light + sky/ground fill + a faint environment for subtle specular.
 * The environment is built from Lightformers instead of the "studio" HDR
 * preset: same soft look, but no ~1 MB HDR download from a third-party CDN.
 */
export function Lights() {
  return (
    <>
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <hemisphereLight args={["#F7F8FA", "#D6E4F5", 0.6]} />
      <Environment resolution={64} environmentIntensity={0.25}>
        <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 5, 1]} />
        <Lightformer intensity={1} position={[-5, 1, 2]} scale={[5, 5, 1]} />
        <Lightformer intensity={1} position={[5, 1, 2]} scale={[5, 5, 1]} />
      </Environment>
    </>
  );
}
