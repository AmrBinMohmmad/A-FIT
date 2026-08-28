import AsyncStorage from '@react-native-async-storage/async-storage';
import { mealService, BackendMeal } from '@/services/mealService';
import { authStorage } from '@/storage/authStorage';

const MEALS_KEY = 'meals';

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
    const data = await AsyncStorage.getItem(MEALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Fetch meals with cloud-sync: pulls latest from backend when authenticated,
 * and falls back to local storage when offline.
 */
export const getMeals = async (): Promise<Meal[]> => {
  const token = await authStorage.getToken();

  if (token) {
    try {
      const backendMeals = await mealService.getUserMeals();
      const mapped = backendMeals.map(mapBackendMeal);
      await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(mapped));
      return mapped;
    } catch (e) {
      console.log('Falling back to local cached meals:', e);
    }
  }

  return await getLocalMeals();
};

/**
 * Add a new meal: syncs with backend when online, caches to local storage.
 */
export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const token = await authStorage.getToken();
  let createdMeal: Meal;

  if (token) {
    try {
      const backendRes = await mealService.createMeal({
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        meal_type: meal.meal_type || 'other',
      });
      createdMeal = mapBackendMeal(backendRes);
    } catch (e) {
      console.warn('Backend meal creation failed, saving locally:', e);
      createdMeal = {
        ...meal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
    }
  } else {
    createdMeal = {
      ...meal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
  }

  const currentMeals = await getLocalMeals();
  const updated = [createdMeal, ...currentMeals.filter((m) => m.id !== createdMeal.id)];
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(updated));

  return createdMeal;
};

/**
 * Delete a meal from backend and local cache.
 */
export const deleteMeal = async (id: string): Promise<void> => {
  const token = await authStorage.getToken();

  if (token) {
    try {
      await mealService.deleteMeal(id);
    } catch (e) {
      console.warn('Backend meal deletion failed:', e);
    }
  }

  const meals = await getLocalMeals();
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
};

/**
 * Clear all meals locally.
 */
export const clearAllMeals = async (): Promise<void> => {
  await AsyncStorage.removeItem(MEALS_KEY);
};