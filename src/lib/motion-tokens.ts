/** Shared motion tokens (adapted from EasyUI motion-tokens). */
export const motionTransitions = {
  springGentle: { type: "spring", stiffness: 120, damping: 20, mass: 0.9 } as const,
  springSnappy: { type: "spring", stiffness: 400, damping: 28, mass: 0.6 } as const,
  springMorph: { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const,
  springResponsive: { type: "spring", stiffness: 500, damping: 32, mass: 0.7 } as const,
  springSmooth: { type: "spring", stiffness: 260, damping: 26, mass: 0.8 } as const
};
