import { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";

import { duration } from "@/constants/tokens";

/**
 * The app's few motion recipes. Reanimated applies the system "Reduce Motion" setting to all
 * of them by default, so every one degrades to an instant change for users who asked for that.
 */
const STAGGER_MS = 35;
const STAGGER_CAP = 8;

/** Rows enter from slightly below, staggered by their index so a list reads top-down. */
export function enterAt(index: number | undefined) {
  if (index === undefined) return undefined;
  return FadeInDown.duration(duration.slow).delay(Math.min(index, STAGGER_CAP) * STAGGER_MS);
}

/** A removed row fades upward while the rest of the list closes the gap. */
export const exitRow = FadeOutUp.duration(duration.base);

/** Siblings slide into place when one is added or removed. */
export const listLayout = LinearTransition.duration(duration.slow);
