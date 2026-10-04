"use client";

import dynamic from "next/dynamic";
import { useBirdMode } from "@/hooks/useBirdMode";

// The whole Three.js tree is split out of the first-load bundle.
const BirdScene = dynamic(() => import("./BirdScene"), { ssr: false });

export function BirdSceneLoader() {
  const mode = useBirdMode();
  return mode === "webgl" ? <BirdScene /> : null;
}
