import { useMutation } from "@tanstack/react-query";

import { DEVICE_NAME } from "@/constants/env";
import type { ApiEnvelope, VerifyOtpResponse } from "@/types/api";
import { api } from "@/utils/api/client";

/** POST auth/otp/request — the success message is shown by the screen, not the toast. */
export function useRequestCode() {
  return useMutation({
    mutationFn: (email: string) => api.post<ApiEnvelope<null>>("auth/otp/request", { email }),
    meta: { silent: true },
  });
}

/** POST auth/otp/verify — returns the raw envelope so the screen can branch on requires_name. */
export function useVerifyCode() {
  return useMutation({
    mutationFn: (vars: { email: string; code: string; name?: string }) =>
      api
        .post<ApiEnvelope<VerifyOtpResponse>>("auth/otp/verify", { ...vars, device_name: DEVICE_NAME })
        .then((res) => res.data),
    meta: { silent: true },
  });
}
