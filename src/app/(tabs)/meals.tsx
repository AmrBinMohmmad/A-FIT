import MealItem from '@/components/MealItem';
import { clearAllMeals, getMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

const showConfirmDialog = (onConfirm: () => Promise<void> | void) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  Alert.alert(
    'حذف',
    'هل انت متأكد من حذف جميع الوجبات',
    [
      {
        text: 'إلغاء',
        onPress: () => console.log('تم الإلغاء'),
        style: 'cancel',
      },
      {
        text: 'حذف',
        onPress: onConfirm,
        style: 'destructive',
      },
    ],
    { cancelable: false } // Prevents dismissal by tapping outside
  );
};

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const handleClearAll = async() => {
    await clearAllMeals();
    loadMeals();
  }

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <View style= {globalStyles.header}>
      <Text style={globalStyles.title}>جميع الوجبات</Text>
      <TouchableOpacity onPress={() => showConfirmDialog(handleClearAll)}>
        <Text style={styles.clearButton}>مسح جميع الوجبات</Text>
      </TouchableOpacity>
      </View>
      <View style={{ marginTop: 30 }}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>لم تسجل وجبات حتى الأن.</Text>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onDelete={loadMeals}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
  clearButton: {
    color: 'red',
    fontSize: 16,
  },
};