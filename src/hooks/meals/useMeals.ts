import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiEnvelope, DayTotals, Meal, MealPayload, Paginated } from "@/types/api";
import { api, buildQueryString, fetcher } from "@/utils/api/client";
import { queryKeys } from "@/utils/api/queryKeys";

/** One local day's meals (server-paginated; a day fits one page of 100). */
export function useMealsForDay(date: string) {
  return useQuery({
    queryKey: queryKeys.meals.day(date),
    queryFn: () => fetcher<Paginated<Meal>>(`meals${buildQueryString({ date, per_page: 100 })}`),
    select: (page) => page.data,
  });
}

export function useMealSummary(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.meals.summary(from, to),
    queryFn: () => fetcher<DayTotals[]>(`meals/summary${buildQueryString({ from, to })}`),
  });
}

function useInvalidateDay() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.meals.all });
    void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

export function useCreateMeal() {
  const invalidate = useInvalidateDay();
  return useMutation({
    mutationFn: (payload: MealPayload) => api.post<ApiEnvelope<Meal>>("meals", payload),
    onSuccess: invalidate,
  });
}

export function useUpdateMeal() {
  const invalidate = useInvalidateDay();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<MealPayload> & { id: number }) =>
      api.put<ApiEnvelope<Meal>>(`meals/${id}`, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteMeal() {
  const invalidate = useInvalidateDay();
  return useMutation({
    mutationFn: (id: number) => api.delete<ApiEnvelope<null>>(`meals/${id}`),
    onSuccess: invalidate,
  });
}
