import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/utils/api/queryKeys";
import { registerStepSyncTask } from "@/utils/steps/backgroundTask";
import { stepSource, type HealthAvailability } from "@/utils/steps/healthSource";
import {
  hasHealthPermission,
  rememberHealthPermission,
  syncSteps,
  type SyncReason,
} from "@/utils/steps/stepSync";

export type HealthState = "unknown" | "unavailable" | "needsUpdate" | "notGranted" | "granted";

async function resolveHealthState(): Promise<HealthState> {
  const availability: HealthAvailability = await stepSource().availability();
  if (availability !== "available") return availability === "needsUpdate" ? "needsUpdate" : "unavailable";
  return (await hasHealthPermission()) ? "granted" : "notGranted";
}

/**
 * Foreground half of step syncing: runs a (throttled) sync when the app becomes active and
 * when asked, refreshes the dashboard and step queries after a successful push, and owns
 * the permission handshake. The background task covers the rest.
 */
export function useStepSync() {
  const qc = useQueryClient();
  const { status } = useAuth();
  const [health, setHealth] = useState<HealthState>("unknown");
  const [syncing, setSyncing] = useState(false);
  const inFlight = useRef(false);

  const refreshQueries = useCallback(() => {
    void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    void qc.invalidateQueries({ queryKey: queryKeys.steps.all });
    void qc.invalidateQueries({ queryKey: queryKeys.groups.all });
  }, [qc]);

  const run = useCallback(
    async (reason: SyncReason) => {
      if (inFlight.current || status !== "signedIn") return;
      inFlight.current = true;
      setSyncing(true);
      try {
        const outcome = await syncSteps(reason);
        if (outcome.status === "synced") refreshQueries();
      } finally {
        inFlight.current = false;
        setSyncing(false);
      }
    },
    [refreshQueries, status],
  );

  const detect = useCallback(async () => {
    const next = await resolveHealthState();
    setHealth(next);
  }, []);

  const requestAccess = useCallback(async () => {
    const adapter = stepSource();
    const granted = await adapter.requestAccess();
    await rememberHealthPermission(granted);
    setHealth(granted ? "granted" : "notGranted");
    if (granted) {
      await adapter.enableBackgroundDelivery();
      await registerStepSyncTask();
      await run("permission");
    }
    return granted;
  }, [run]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const next = await resolveHealthState();
      if (active) setHealth(next);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status !== "signedIn") return;
    void registerStepSyncTask();
    void run("foreground");
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") void run("foreground");
    });
    return () => sub.remove();
  }, [status, run]);

  return { health, syncing, requestAccess, syncNow: () => run("manual"), redetect: detect };
}
