import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiEnvelope, WeightEntry } from "@/types/api";
import { api, buildQueryString, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

export function useWeightHistory(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.weights.history(from, to),
    queryFn: () => fetcher<WeightEntry[]>(`weights${buildQueryString({ from, to })}`),
  });
}

function useInvalidateWeights() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.weights.all });
    void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

export function useSaveWeight() {
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: (payload: { date: string; weight_kg: number }) =>
      api.post<ApiEnvelope<WeightEntry>>("weights", payload),
    onSuccess: invalidate,
  });
}

export function useDeleteWeight() {
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: (id: number) => api.delete<ApiEnvelope<null>>(`weights/${id}`),
    onSuccess: invalidate,
  });
}
