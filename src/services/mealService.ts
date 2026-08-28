import { apiClient } from './api';

export interface BackendMeal {
  id: number;
  user_id: number;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMealInput {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
}

export const mealService = {
  /**
   * Fetch all meals belonging to the authenticated user
   */
  async getUserMeals(): Promise<BackendMeal[]> {
    const res = await apiClient.get<any>('/meal/getUserMeals');
    // Handle ApiResponse format or direct array
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }
    if (res?.meals && Array.isArray(res.meals)) {
      return res.meals;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Create a new meal record on the backend
   */
  async createMeal(input: CreateMealInput): Promise<BackendMeal> {
    const res = await apiClient.post<any>('/meal/createMeal', input);
    return res?.data || res?.meal || res;
  },

  /**
   * Get a single meal by ID
   */
  async getMeal(id: number | string): Promise<BackendMeal> {
    const res = await apiClient.get<any>(`/meal/${id}`);
    return res?.data || res?.meal || res;
  },

  /**
   * Update an existing meal
   */
  async updateMeal(id: number | string, input: Partial<CreateMealInput>): Promise<BackendMeal> {
    const res = await apiClient.put<any>(`/meal/${id}`, input);
    return res?.data || res?.meal || res;
  },

  /**
   * Delete a meal by ID
   */
  async deleteMeal(id: number | string): Promise<void> {
    await apiClient.delete(`/meal/${id}`);
  },
};

