/** Shared motion tokens (adapted from EasyUI motion-tokens). */
export const motionTransitions = {
  springGentle: { type: "spring", stiffness: 120, damping: 20, mass: 0.9 } as const,
  springSnappy: { type: "spring", stiffness: 400, damping: 28, mass: 0.6 } as const,
  springMorph: { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const
};
