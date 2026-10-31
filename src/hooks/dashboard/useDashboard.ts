import { useQuery } from "@tanstack/react-query";

import type { Dashboard } from "@/types/api";
import { buildQueryString, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

/** GET dashboard — the whole home screen in one request; 60 s stale, refetched on pull. */
export function useDashboard(date: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.day(date),
    queryFn: () => fetcher<Dashboard>(`dashboard${buildQueryString({ date })}`),
  });
}
