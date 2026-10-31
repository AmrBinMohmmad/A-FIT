import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import type { ApiEnvelope, WaterEntry } from "@/types/api";
import { api, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

/** How long a burst of taps may settle before ONE request carries the final total. */
export const WATER_FLUSH_MS = 900;

export function useWater(date: string) {
  return useQuery({
    queryKey: queryKeys.water.day(date),
    queryFn: () => fetcher<WaterEntry>(`water/${date}`),
  });
}

/**
 * Water controls that coalesce writes. Every tap updates the Query cache instantly (so the UI
 * is driven by the cache, never by a ref) and the absolute total is PUT once the burst settles
 * or the screen unmounts: ten taps cost one request instead of ten rate-limited ones.
 */
export function useWaterControls(date: string) {
  const qc = useQueryClient();
  const query = useWater(date);
  const key = queryKeys.water.day(date);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<number | null>(null);

  const mutation = useMutation({
    mutationFn: (ml: number) => api.put<ApiEnvelope<WaterEntry>>(`water/${date}`, { ml }),
    meta: { silent: true },
    onSuccess: (res) => {
      // A newer local value may have arrived while this request was in flight; keep it.
      if (pending.current === null) qc.setQueryData<WaterEntry>(key, res.data.data);
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: () => void qc.invalidateQueries({ queryKey: key }),
  });
  const { mutate } = mutation;

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current === null) return;
    const ml = pending.current;
    pending.current = null;
    mutate(ml);
  }, [mutate]);

  const set = useCallback(
    (ml: number) => {
      const clamped = Math.max(0, Math.min(15000, Math.round(ml)));
      pending.current = clamped;
      qc.setQueryData<WaterEntry>(key, { date, ml: clamped });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, WATER_FLUSH_MS);
    },
    [date, flush, key, qc],
  );

  const add = useCallback(
    (delta: number) => set((qc.getQueryData<WaterEntry>(key)?.ml ?? 0) + delta),
    [key, qc, set],
  );

  // Leaving the screen flushes whatever is still pending.
  useEffect(() => flush, [flush]);

  return { query, ml: query.data?.ml ?? 0, add, set, saving: mutation.isPending };
}
