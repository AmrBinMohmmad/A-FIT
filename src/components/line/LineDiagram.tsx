import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { RText } from "@/components/RText";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";
import { formatCompact, formatInt } from "@/utils/number";

export interface LineMarker {
  id: number | string;
  label: string;
  value: number;
}

interface LineDiagramProps {
  value: number;
  goal: number;
  /** Other people on the same line (friends); rendered as thin ticks. */
  markers?: LineMarker[];
  youLabel: string;
  /** Station values under the line. Defaults to 0 / 20% / 50% / 80% / goal. */
  stations?: number[];
  compact?: boolean;
}

const TRACK_H = 6;
const ROUNDEL = 20;
const YOU = 28;
const LABEL_W = 44;

const useStyles = makeStyles((theme) => ({
  wrap: { paddingTop: 34, paddingBottom: 4 },
  trackArea: { height: YOU, justifyContent: "center" },
  track: { height: TRACK_H, borderRadius: TRACK_H / 2, backgroundColor: theme.colors.track },
  progress: {
    position: "absolute",
    start: 0,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: theme.colors.primary,
  },
  station: {
    position: "absolute",
    width: ROUNDEL,
    height: ROUNDEL,
    borderRadius: ROUNDEL / 2,
    borderWidth: 4,
    backgroundColor: theme.colors.background,
    marginStart: -ROUNDEL / 2,
  },
  tick: {
    position: "absolute",
    width: 2,
    height: 30,
    backgroundColor: theme.colors.textPrimary,
    marginStart: -1,
    top: -1,
  },
  you: {
    position: "absolute",
    width: YOU,
    height: YOU,
    borderRadius: YOU / 2,
    backgroundColor: theme.colors.accent,
    borderWidth: 4,
    borderColor: theme.colors.background,
    marginStart: -YOU / 2,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  flag: {
    position: "absolute",
    top: -32,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  labels: { height: 20, marginTop: theme.spacing.sm },
  label: { position: "absolute", width: LABEL_W, marginStart: -LABEL_W / 2 },
}));

/**
 * The journey line: a track across the full width, stations at fixed shares of the goal,
 * friends as thin ticks and "you" as the orange roundel that travels (600 ms, ease-out) when
 * the value changes. Every position uses the logical `start` edge, so the line reads from the
 * writing-direction origin in both LTR and RTL without any manual mirroring.
 */
export function LineDiagram({ value, goal, markers = [], youLabel, stations, compact }: LineDiagramProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { isRTL } = useRTL();
  const reduceMotion = useReducedMotion();

  const safeGoal = Math.max(goal, 1);
  const clamp = (v: number) => Math.min(1, Math.max(0, v / safeGoal));
  const progress = useSharedValue(clamp(value));

  useEffect(() => {
    // Reduce Motion / Remove animations: jump to the new position instead of travelling.
    if (reduceMotion) {
      progress.value = clamp(value);
      return;
    }
    progress.value = withTiming(clamp(value), {
      duration: theme.duration.travel,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate on value/goal change only
  }, [value, goal, reduceMotion]);

  const youStyle = useAnimatedStyle(() => ({ start: `${progress.value * 100}%` }));
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const stationValues = stations ?? [0, 0.2, 0.5, 0.8, 1].map((s) => Math.round(safeGoal * s));
  const at = (v: number) => ({ start: `${clamp(v) * 100}%` }) as const;
  const share = clamp(value);
  // Near either terminus the flag would spill outside the panel; pin it to the inner side.
  const flagClamp = share < 0.12 ? { start: -4 } : share > 0.88 ? { end: -4 } : null;
  const edgeAlign = (first: boolean) => (first === !isRTL ? "left" : "right");

  return (
    <View style={styles.wrap}>
      <View style={styles.trackArea}>
        <View style={styles.track} />
        <Animated.View style={[styles.progress, progressStyle]} />
        {stationValues.map((s) => (
          <View
            key={`s-${s}`}
            style={[
              styles.station,
              at(s),
              { borderColor: value >= s ? theme.colors.primary : theme.colors.track },
            ]}
          />
        ))}
        {markers.map((m) => (
          <View
            key={`m-${m.id}`}
            style={[styles.tick, at(m.value)]}
            accessibilityLabel={`${m.label} ${formatInt(m.value)}`}
          />
        ))}
        <Animated.View style={[styles.you, youStyle]} accessibilityRole="image" accessibilityLabel={youLabel}>
          <View style={[styles.flag, flagClamp]}>
            <RText variant="footnote" weight="bold" color="onAccent" tabular numberOfLines={1}>
              {youLabel}
            </RText>
          </View>
        </Animated.View>
      </View>

      {!compact ? (
        <View style={styles.labels}>
          {stationValues.map((s, i) => {
            const first = i === 0;
            const last = i === stationValues.length - 1;
            const edge = first || last;
            return (
              <RText
                key={`l-${s}`}
                variant="caption"
                color="textMuted"
                tabular
                align={edge ? edgeAlign(first) : "center"}
                style={[styles.label, at(s), first && { marginStart: 0 }, last && { marginStart: -LABEL_W }]}>
                {formatCompact(s)}
              </RText>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
