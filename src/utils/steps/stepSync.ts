/**
 * Reads daily totals from the OS health store and pushes ONLY the days whose total changed
 * since the last sync, in one PUT. This is what keeps the server cheap: a quiet phone sends
 * nothing, an active one sends one row every few minutes at most.
 */
import { STORAGE_KEYS } from "@/constants/storage";
import type { ApiEnvelope, StepSyncPayload, StepSyncResponse } from "@/types/api";
import { api } from "@/utils/api/client";
import { logger } from "@/utils/logger";
import { getToken } from "@/utils/secureStore";
import { stepSource, type DailyTotal } from "@/utils/steps/healthSource";
import { getItem, setItem } from "@/utils/storage";

export type SyncReason = "foreground" | "background" | "manual" | "permission";

export interface SyncOutcome {
  status: "synced" | "nothingNew" | "skipped" | "failed";
  changed: number;
  totals: DailyTotal[];
}

/** Minimum gap between automatic syncs; manual syncs ignore it. */
export const MIN_SYNC_GAP_MS = 10 * 60 * 1000;

/** Days re-read on every sync; the store can back-fill late samples for recent days. */
export const SYNC_WINDOW_DAYS = 7;

type Snapshot = Record<string, number>;

export async function lastSyncedAt(): Promise<number | null> {
  return getItem<number>(STORAGE_KEYS.stepsLastSync);
}

export async function hasHealthPermission(): Promise<boolean> {
  return (await getItem<boolean>(STORAGE_KEYS.healthPermission)) === true;
}

export async function rememberHealthPermission(granted: boolean): Promise<void> {
  await setItem(STORAGE_KEYS.healthPermission, granted);
}

export async function syncSteps(reason: SyncReason): Promise<SyncOutcome> {
  const empty: SyncOutcome = { status: "skipped", changed: 0, totals: [] };

  if (!(await getToken())) return empty;
  if (!(await hasHealthPermission())) return empty;

  if (reason !== "manual" && reason !== "permission") {
    const last = await lastSyncedAt();
    if (last && Date.now() - last < MIN_SYNC_GAP_MS) return empty;
  }

  const adapter = stepSource();
  let totals: DailyTotal[];
  try {
    totals = await adapter.readDailyTotals(SYNC_WINDOW_DAYS);
  } catch (error) {
    logger.warn("Step read failed", error);
    return { ...empty, status: "failed" };
  }

  const snapshot = (await getItem<Snapshot>(STORAGE_KEYS.stepsSnapshot)) ?? {};
  const changed = totals.filter((t) => snapshot[t.date] !== t.steps);

  if (changed.length === 0) {
    await setItem(STORAGE_KEYS.stepsLastSync, Date.now());
    return { status: "nothingNew", changed: 0, totals };
  }

  const payload: StepSyncPayload = {
    entries: changed.map((t) => ({ date: t.date, steps: t.steps, source: adapter.source })),
  };

  try {
    await api.put<ApiEnvelope<StepSyncResponse>>("steps", payload);
  } catch (error) {
    logger.warn(`Step sync (${reason}) failed`, error);
    return { status: "failed", changed: changed.length, totals };
  }

  const nextSnapshot: Snapshot = { ...snapshot };
  for (const t of changed) nextSnapshot[t.date] = t.steps;
  // Keep the snapshot bounded to the window so it never grows unbounded.
  const keep = new Set(totals.map((t) => t.date));
  for (const key of Object.keys(nextSnapshot)) if (!keep.has(key)) delete nextSnapshot[key];

  await setItem(STORAGE_KEYS.stepsSnapshot, nextSnapshot);
  await setItem(STORAGE_KEYS.stepsLastSync, Date.now());

  return { status: "synced", changed: changed.length, totals };
}
