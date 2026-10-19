"use client";
import { Tilt } from "@/components/motionprimitives/tilt";

/** Gentle 3D tilt on landing feature cards (desktop pointer only; static under reduced-motion). */
export default function FeatureTilt({ children }: { children: React.ReactNode }) {
  return (
    <Tilt rotationFactor={6} springOptions={{ stiffness: 180, damping: 18, mass: 0.6 }} className="h-full">
      {children}
    </Tilt>
  );
}
