import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiEnvelope, Challenge, ChallengePayload, Paginated } from "@/types/api";
import { api, buildQueryString, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

export function useGroupChallenges(groupId: number) {
  return useQuery({
    queryKey: queryKeys.groups.challenges(groupId),
    queryFn: () =>
      fetcher<Paginated<Challenge>>(`groups/${groupId}/challenges${buildQueryString({ per_page: 20 })}`),
    select: (page) => page.data,
    enabled: Number.isFinite(groupId) && groupId > 0,
  });
}

export function useChallenge(id: number) {
  return useQuery({
    queryKey: queryKeys.challenges.detail(id),
    queryFn: () => fetcher<Challenge>(`challenges/${id}`),
    refetchInterval: 120_000,
    enabled: Number.isFinite(id) && id > 0,
  });
}

function useInvalidateChallenges() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.groups.all });
    void qc.invalidateQueries({ queryKey: queryKeys.challenges.all });
    void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

export function useCreateChallenge(groupId: number) {
  const invalidate = useInvalidateChallenges();
  return useMutation({
    mutationFn: (payload: ChallengePayload) =>
      api.post<ApiEnvelope<Challenge>>(`groups/${groupId}/challenges`, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteChallenge() {
  const invalidate = useInvalidateChallenges();
  return useMutation({
    mutationFn: (id: number) => api.delete<ApiEnvelope<null>>(`challenges/${id}`),
    onSuccess: invalidate,
  });
}
