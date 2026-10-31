/**
 * The platform step source behind one interface: HealthKit on iOS, Health Connect on
 * Android. Both read the OS health store, so steps count whether or not A-FIT is open.
 * Everything else in the app talks to this module, never to the libraries directly.
 */
import { Platform } from "react-native";

import type { StepSource } from "@/types/api";
import { addDays, startOfDay, toDateKey } from "@/utils/date";
import { logger } from "@/utils/logger";

export type HealthAvailability = "available" | "unavailable" | "needsUpdate";

export interface DailyTotal {
  date: string;
  steps: number;
}

export interface StepSourceAdapter {
  source: StepSource;
  availability(): Promise<HealthAvailability>;
  /** Asks the OS for read access to steps (and background read on Android). */
  requestAccess(): Promise<boolean>;
  /** Per-local-day totals for the last `days` days, today included. */
  readDailyTotals(days: number): Promise<DailyTotal[]>;
  /** Lets the OS wake the app when new step samples land (iOS); no-op elsewhere. */
  enableBackgroundDelivery(): Promise<void>;
}

const STEP_TYPE = "HKQuantityTypeIdentifierStepCount" as const;

function dayWindows(days: number): { date: string; start: Date; end: Date }[] {
  const today = startOfDay(new Date());
  const windows: { date: string; start: Date; end: Date }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = addDays(today, -i);
    const end = addDays(start, 1);
    windows.push({ date: toDateKey(start), start, end });
  }
  return windows;
}

const healthKitAdapter: StepSourceAdapter = {
  source: "healthkit",

  async availability() {
    const hk = await import("@kingstinct/react-native-healthkit");
    return (await hk.isHealthDataAvailableAsync()) ? "available" : "unavailable";
  },

  async requestAccess() {
    const hk = await import("@kingstinct/react-native-healthkit");
    try {
      await hk.requestAuthorization({ toRead: [STEP_TYPE] });
      // HealthKit never reveals read-permission status; a successful prompt is the best signal.
      return true;
    } catch (error) {
      logger.warn("HealthKit authorization failed", error);
      return false;
    }
  },

  async readDailyTotals(days) {
    const hk = await import("@kingstinct/react-native-healthkit");
    const totals: DailyTotal[] = [];
    for (const window of dayWindows(days)) {
      try {
        const stats = await hk.queryStatisticsForQuantity(STEP_TYPE, ["cumulativeSum"], {
          filter: { date: { startDate: window.start, endDate: window.end } },
          unit: "count",
        });
        totals.push({ date: window.date, steps: Math.round(stats.sumQuantity?.quantity ?? 0) });
      } catch (error) {
        logger.warn(`HealthKit read failed for ${window.date}`, error);
        totals.push({ date: window.date, steps: 0 });
      }
    }
    return totals;
  },

  async enableBackgroundDelivery() {
    const hk = await import("@kingstinct/react-native-healthkit");
    const { UpdateFrequency } = await import("@react-native-healthkit/core");
    try {
      await hk.enableBackgroundDelivery(STEP_TYPE, UpdateFrequency.hourly);
    } catch (error) {
      logger.warn("HealthKit background delivery not enabled", error);
    }
  },
};

const healthConnectAdapter: StepSourceAdapter = {
  source: "health_connect",

  async availability() {
    const hc = await import("react-native-health-connect");
    const status = await hc.getSdkStatus();
    if (status === hc.SdkAvailabilityStatus.SDK_AVAILABLE) return "available";
    if (status === hc.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return "needsUpdate";
    return "unavailable";
  },

  async requestAccess() {
    const hc = await import("react-native-health-connect");
    try {
      const ok = await hc.initialize();
      if (!ok) return false;
      const granted = await hc.requestPermission([
        { accessType: "read", recordType: "Steps" },
        { accessType: "read", recordType: "BackgroundAccessPermission" },
      ]);
      return granted.some((p) => p.recordType === "Steps" && p.accessType === "read");
    } catch (error) {
      logger.warn("Health Connect permission request failed", error);
      return false;
    }
  },

  async readDailyTotals(days) {
    const hc = await import("react-native-health-connect");
    await hc.initialize();
    const windows = dayWindows(days);
    const first = windows[0];
    const last = windows[windows.length - 1];
    if (!first || !last) return [];
    const byDate = new Map(windows.map((w) => [w.date, 0]));
    try {
      const groups = await hc.aggregateGroupByPeriod({
        recordType: "Steps",
        timeRangeFilter: {
          operator: "between",
          startTime: first.start.toISOString(),
          endTime: last.end.toISOString(),
        },
        timeRangeSlicer: { period: "DAYS", length: 1 },
      });
      for (const group of groups) {
        const key = toDateKey(new Date(group.startTime));
        if (byDate.has(key)) byDate.set(key, Math.round(group.result.COUNT_TOTAL ?? 0));
      }
    } catch (error) {
      logger.warn("Health Connect aggregate failed", error);
    }
    return windows.map((w) => ({ date: w.date, steps: byDate.get(w.date) ?? 0 }));
  },

  async enableBackgroundDelivery() {
    // Health Connect has no push; the periodic background task re-reads the store.
  },
};

const unsupportedAdapter: StepSourceAdapter = {
  source: "manual",
  availability: async () => "unavailable",
  requestAccess: async () => false,
  readDailyTotals: async () => [],
  enableBackgroundDelivery: async () => undefined,
};

export function stepSource(): StepSourceAdapter {
  if (Platform.OS === "ios") return healthKitAdapter;
  if (Platform.OS === "android") return healthConnectAdapter;
  return unsupportedAdapter;
}
