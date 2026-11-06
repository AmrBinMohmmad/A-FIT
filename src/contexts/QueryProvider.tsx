import NetInfo from "@react-native-community/netinfo";
import {
  focusManager,
  MutationCache,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { toastBridge } from "@/contexts/ToastContext";
import type { ApiEnvelope } from "@/types/api";
import { errorMessage, normalizeError } from "@/utils/api/errors";
import i18n from "@/utils/localization/i18n";

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

/**
 * Shared TanStack Query defaults tuned for a small server: 60 s staleTime, one retry,
 * no refetch on focus (screens refetch deliberately), and exactly one toast per mutation
 * read from the envelope `message` (opt out with `meta: { silent: true }`).
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (data, _vars, _ctx, mutation) => {
        if (mutation.meta?.silent) return;
        const body = (data as AxiosResponse<ApiEnvelope<unknown>> | undefined)?.data;
        if (body?.message) toastBridge.current?.success(body.message);
      },
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.silent) return;
        toastBridge.current?.error(errorMessage(normalizeError(error), (k) => i18n.t(k)));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        retry: (failureCount, error) => {
          const status = normalizeError(error).status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: { retry: 0 },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<QueryClient | null>(null);
  const client = (clientRef.current ??= createQueryClient());

  useEffect(() => {
    const sub = AppState.addEventListener("change", (status: AppStateStatus) =>
      focusManager.setFocused(status === "active"),
    );
    return () => sub.remove();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
