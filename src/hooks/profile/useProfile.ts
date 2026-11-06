import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AvatarKey } from "@/constants/avatars";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiEnvelope, SaveProfilePayload, User, UserProfile } from "@/types/api";
import { api, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => fetcher<UserProfile | null>("me/profile"),
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (payload: SaveProfilePayload) => api.put<ApiEnvelope<UserProfile>>("me/profile", payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void refreshUser();
    },
  });
}

export function useUpdateMe() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (payload: { name?: string; locale?: "ar" | "en"; avatar?: AvatarKey | null }) =>
      api.patch<ApiEnvelope<User>>("me", payload),
    onSuccess: (res) => setUser(res.data.data),
  });
}

export function useDeleteAccount() {
  const { signOut } = useAuth();
  return useMutation({
    mutationFn: () => api.delete<ApiEnvelope<null>>("me"),
    onSuccess: () => void signOut(),
  });
}
