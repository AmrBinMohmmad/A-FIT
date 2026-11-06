import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ApiEnvelope,
  BarcodeLookup,
  Food,
  FoodCategory,
  FoodDetail,
  FoodPayload,
  LookupResults,
  Paginated,
} from "@/types/api";
import { api, buildQueryString, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

export const MIN_QUERY_LENGTH = 2;

/**
 * Catalog search. Runs only for a settled query of 2+ characters or a chosen aisle; results
 * stay fresh for 10 minutes so re-typing the same word costs nothing.
 */
export function useFoodSearch(q: string, category: FoodCategory | null) {
  const query = q.trim();
  const enabled = query.length >= MIN_QUERY_LENGTH || category !== null;
  return useQuery({
    queryKey: queryKeys.foods.search(query, category),
    queryFn: () => fetcher<Paginated<Food>>(`foods${buildQueryString({ q: query, category, per_page: 30 })}`),
    select: (page) => page.data,
    enabled,
    staleTime: 10 * 60_000,
    placeholderData: (previous) => previous,
  });
}

/** The user's recently logged foods — the picker's empty state. */
export function useRecentFoods() {
  return useQuery({
    queryKey: queryKeys.foods.recent,
    queryFn: () => fetcher<Food[]>("foods/recent"),
    staleTime: 5 * 60_000,
  });
}

/** One food with its kinds/brands; only fetched when the user opens a generic item. */
export function useFoodDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.foods.detail(id ?? 0),
    queryFn: () => fetcher<FoodDetail>(`foods/${id}`),
    enabled: id !== null,
    staleTime: 10 * 60_000,
  });
}

export function useCreateFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FoodPayload) => api.post<ApiEnvelope<Food>>("foods", payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.foods.all }),
  });
}

export function useDeleteFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<ApiEnvelope<null>>(`foods/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.foods.all }),
  });
}

/**
 * Online products for a name — only when the user asks (`enabled`), never per keystroke; the
 * server caches a query for a day, the client for the session.
 */
export function useOnlineFoodSearch(q: string, enabled: boolean) {
  const query = q.trim();
  return useQuery({
    queryKey: queryKeys.foods.lookup(query),
    queryFn: () => fetcher<LookupResults>(`foods/lookup${buildQueryString({ q: query })}`),
    enabled: enabled && query.length >= MIN_QUERY_LENGTH,
    staleTime: Infinity,
  });
}

/** One online product for a scanned code the catalog did not know. */
export function useBarcodeLookup(code: string | null) {
  return useQuery({
    queryKey: queryKeys.foods.barcode(code ?? ""),
    queryFn: () => fetcher<BarcodeLookup>(`foods/lookup/${code}`),
    enabled: code !== null,
    staleTime: Infinity,
  });
}

/** Files an online product in the shared catalog and returns it as a Food (idempotent). */
export function useImportFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (barcode: string) => api.post<ApiEnvelope<Food>>("foods/import", { barcode }),
    meta: { silent: true },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.foods.all }),
  });
}
