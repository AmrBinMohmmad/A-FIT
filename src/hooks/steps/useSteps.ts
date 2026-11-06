import { useQuery } from "@tanstack/react-query";

import type { StepHistory } from "@/types/api";
import { buildQueryString, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

/** GET steps?from&to — bounded server history (≤ 90 days). */
export function useStepHistory(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.steps.history(from, to),
    queryFn: () => fetcher<StepHistory>(`steps${buildQueryString({ from, to })}`),
  });
}
