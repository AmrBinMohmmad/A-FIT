import { Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { Text, View } from 'react-native';
import MealItem from './MealItem';

type RecentMealsProps = {
  meals: Meal[];
  onDelete: ()=> void;
}

export default function RecentMeals({meals,onDelete}: RecentMealsProps) {
  return (
    <View style={{ marginTop:5 }}>
      <Text style={globalStyles.sectionTitle}>الوجبات الأخيرة</Text>
      {meals.length === 0 ? (
        <Text style={globalStyles.empty}>لم تسجل وجبات حتى الأن</Text>
      ) : (
        meals
        .slice(0, 5)
        .map((meal)=> (
          <MealItem
          key={meal.id}
          id={meal.id}
          name={meal.name}
          calories={meal.calories}
          protein={meal.protein}
          carbs={meal.carbs}
          fat={meal.fat}
          onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
}