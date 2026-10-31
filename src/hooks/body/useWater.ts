import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiEnvelope, WaterEntry } from "@/types/api";
import { api, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

export function useWater(date: string) {
  return useQuery({
    queryKey: queryKeys.water.day(date),
    queryFn: () => fetcher<WaterEntry>(`water/${date}`),
  });
}

/** PUT water/{date} with the ABSOLUTE total; optimistic so taps feel instant. */
export function useSetWater(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ml: number) => api.put<ApiEnvelope<WaterEntry>>(`water/${date}`, { ml }),
    meta: { silent: true },
    onMutate: async (ml) => {
      await qc.cancelQueries({ queryKey: queryKeys.water.day(date) });
      const previous = qc.getQueryData<WaterEntry>(queryKeys.water.day(date));
      qc.setQueryData<WaterEntry>(queryKeys.water.day(date), { date, ml });
      return { previous };
    },
    onError: (_err, _ml, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.water.day(date), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.water.day(date) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
