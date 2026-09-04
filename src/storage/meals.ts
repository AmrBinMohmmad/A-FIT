import AsyncStorage from '@react-native-async-storage/async-storage';
import { mealService, BackendMeal } from '@/services/mealService';
import { authStorage } from '@/storage/authStorage';

const LEGACY_GLOBAL_MEALS_KEY = 'meals';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  createdAt: string;
};

/**
 * Generate a dynamic storage key scoped to the currently logged in user ID.
 * Prevents account cross-contamination.
 */
const getMealsKey = async (): Promise<string> => {
  try {
    const user = await authStorage.getUser();
    if (user?.id) {
      return `meals_user_${user.id}`;
    }
  } catch (e) {
    console.error('Failed to get user for meals key', e);
  }
  return 'meals_guest';
};

function mapBackendMeal(b: BackendMeal): Meal {
  return {
    id: String(b.id),
    name: b.name,
    calories: Number(b.calories) || 0,
    protein: Number(b.protein) || 0,
    carbs: Number(b.carbs) || 0,
    fat: Number(b.fat) || 0,
    meal_type: b.meal_type || 'other',
    createdAt: b.created_at || new Date().toISOString(),
  };
}

const getLocalMeals = async (): Promise<Meal[]> => {
  try {
    // Purge obsolete un-scoped global key if still present
    await AsyncStorage.removeItem(LEGACY_GLOBAL_MEALS_KEY).catch(() => {});

    const key = await getMealsKey();
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Fetch meals with cloud-sync: pulls latest from backend for the authenticated user,
 * and falls back to user-scoped local storage when offline.
 */
export const getMeals = async (): Promise<Meal[]> => {
  const token = await authStorage.getToken();
  const key = await getMealsKey();

  if (token) {
    try {
      const backendMeals = await mealService.getUserMeals();
      const mapped = backendMeals.map(mapBackendMeal);
      await AsyncStorage.setItem(key, JSON.stringify(mapped));
      return mapped;
    } catch (e) {
      console.log('Falling back to local cached meals:', e);
    }
  }

  return await getLocalMeals();
};

/**
 * Add a new meal: syncs with backend when online, caches to user-scoped storage.
 */
export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const token = await authStorage.getToken();
  const key = await getMealsKey();
  let createdMeal: Meal;

  if (token) {
    const backendRes = await mealService.createMeal({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      meal_type: meal.meal_type || 'other',
    });
    createdMeal = mapBackendMeal(backendRes);
  } else {
    createdMeal = {
      ...meal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
  }

  const currentMeals = await getLocalMeals();
  const updated = [createdMeal, ...currentMeals.filter((m) => m.id !== createdMeal.id)];
  await AsyncStorage.setItem(key, JSON.stringify(updated));

  return createdMeal;
};

/**
 * Update an existing meal on the backend and sync with user-scoped cache.
 */
export const updateMeal = async (
  id: string,
  meal: Partial<Omit<Meal, 'id' | 'createdAt'>>,
): Promise<Meal> => {
  const token = await authStorage.getToken();
  const key = await getMealsKey();
  let updatedMeal: Meal;

  if (token) {
    const backendRes = await mealService.updateMeal(id, meal);
    updatedMeal = mapBackendMeal(backendRes);
  } else {
    const currentMeals = await getLocalMeals();
    const existing = currentMeals.find((m) => m.id === id);
    updatedMeal = {
      ...(existing || { id, name: '', calories: 0, protein: 0, carbs: 0, fat: 0, createdAt: new Date().toISOString() }),
      ...meal,
    };
  }

  const currentMeals = await getLocalMeals();
  const updated = currentMeals.map((m) => (m.id === id ? updatedMeal : m));
  await AsyncStorage.setItem(key, JSON.stringify(updated));

  return updatedMeal;
};

/**
 * Delete a meal from backend and user-scoped cache.
 */
export const deleteMeal = async (id: string): Promise<void> => {
  const token = await authStorage.getToken();
  const key = await getMealsKey();

  if (token) {
    await mealService.deleteMeal(id);
  }

  const meals = await getLocalMeals();
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(key, JSON.stringify(filtered));
};

/**
 * Clear all meals for the currently active user (both backend and local cache).
 */
export const clearAllMeals = async (): Promise<void> => {
  const token = await authStorage.getToken();
  const key = await getMealsKey();

  if (token) {
    await mealService.clearUserMeals();
  }

  await AsyncStorage.removeItem(key);
  await AsyncStorage.removeItem(LEGACY_GLOBAL_MEALS_KEY).catch(() => {});
};