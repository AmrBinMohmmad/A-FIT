import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import type { ApiEnvelope, Group, User } from "@/types/api";
import { api } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";
import { photoFormData } from "@/utils/photos";

/** Uploads a square JPEG (already downsized by pickSquarePhoto) as the user's avatar. */
export function useUploadAvatar() {
  const { setUser } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uri: string) => api.post<ApiEnvelope<User>>("me/avatar", photoFormData(uri)),
    onSuccess: (res) => {
      setUser(res.data.data);
      void qc.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useRemoveAvatar() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: () => api.delete<ApiEnvelope<User>>("me/avatar"),
    onSuccess: (res) => setUser(res.data.data),
  });
}

export function useUploadGroupPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, uri }: { groupId: number; uri: string }) =>
      api.post<ApiEnvelope<Group>>(`groups/${groupId}/photo`, photoFormData(uri)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.groups.all }),
  });
}

export function useRemoveGroupPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => api.delete<ApiEnvelope<Group>>(`groups/${groupId}/photo`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.groups.all }),
  });
}
