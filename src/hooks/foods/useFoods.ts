import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiEnvelope, Food, FoodCategory, FoodDetail, FoodPayload, Paginated } from "@/types/api";
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
