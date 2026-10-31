import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import type { ApiEnvelope } from "@/types/api";
import { api } from "@/utils/api/client";

/** "Sign out of all devices": revokes every token server-side, then clears this device. */
export function useSignOutEverywhere() {
  const { signOut } = useAuth();
  return useMutation({
    mutationFn: () => api.post<ApiEnvelope<null>>("auth/logout-all"),
    onSuccess: () => void signOut(),
  });
}
