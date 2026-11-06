import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiEnvelope, Group, GroupDetail, Leaderboard, LeaderboardPeriod, Paginated } from "@/types/api";
import { api, buildQueryString, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

/** The caller's groups — a person belongs to a handful, so one page covers it. */
export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups.list,
    queryFn: () => fetcher<Paginated<Group>>(`groups${buildQueryString({ per_page: 50 })}`),
    select: (page) => page.data,
  });
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: queryKeys.groups.detail(id),
    queryFn: () => fetcher<GroupDetail>(`groups/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  });
}

/** Cached server-side for 60 s; the screen polls at that cadence only while mounted. */
export function useLeaderboard(id: number, period: LeaderboardPeriod, date: string) {
  return useQuery({
    queryKey: queryKeys.groups.leaderboard(id, period, date),
    queryFn: () => fetcher<Leaderboard>(`groups/${id}/leaderboard${buildQueryString({ period, date })}`),
    refetchInterval: 60_000,
    enabled: Number.isFinite(id) && id > 0,
  });
}

function useInvalidateGroups() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.groups.all });
    void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

export function useCreateGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (name: string) => api.post<ApiEnvelope<Group>>("groups", { name }),
    onSuccess: invalidate,
  });
}

export function useJoinGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (code: string) => api.post<ApiEnvelope<Group>>("groups/join", { code }),
    onSuccess: invalidate,
  });
}

export function useRenameGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.patch<ApiEnvelope<Group>>(`groups/${id}`, { name }),
    onSuccess: invalidate,
  });
}

export function useDeleteGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (id: number) => api.delete<ApiEnvelope<null>>(`groups/${id}`),
    onSuccess: invalidate,
  });
}

export function useLeaveGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (id: number) => api.post<ApiEnvelope<null>>(`groups/${id}/leave`),
    onSuccess: invalidate,
  });
}

export function useRotateInvite() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (id: number) => api.post<ApiEnvelope<Group>>(`groups/${id}/invite/rotate`),
    onSuccess: invalidate,
  });
}

export function useRemoveMember() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      api.delete<ApiEnvelope<null>>(`groups/${groupId}/members/${userId}`),
    onSuccess: invalidate,
  });
}
