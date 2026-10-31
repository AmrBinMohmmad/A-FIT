import { Platform, type ViewStyle } from "react-native";

/** Signage is border-first; shadow only hints altitude on floating sign panels. */
type Shadow = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

function shadow(elevation: number, opacity: number, radius: number, offsetY: number): Shadow {
  return Platform.select<Shadow>({
    ios: {
      shadowColor: "#0E1B2B",
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as Shadow;
}

export const shadows = {
  none: {} as Shadow,
  card: shadow(1, 0.05, 2, 1),
  sm: shadow(2, 0.08, 4, 2),
  md: shadow(6, 0.12, 12, 6),
} as const;

export type Shadows = typeof shadows;
