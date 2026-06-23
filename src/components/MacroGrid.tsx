import { StyleSheet, View } from 'react-native';
import MacroCard from './MacroCard';
import { Meal } from '@/storage/meals';


type MacroGridProps = {
    meals: Meal[];
};

export default function MacroGrid({meals}: MacroGridProps) {
    const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
)
        
    
  return (
    <View style={styles.grid}>
      <MacroCard
        label='السعرات'
        value={`${totals.calories}`}
        goal='2,000'
        color='#ff6b6b'
      />
      <MacroCard
        label='البروتين'
        value={`${totals.protein}g`}
        goal='150g'
        color='#4ecdc4'
      />
      <MacroCard
        label='الكارب'
        value={`${totals.carbs}g`}
        goal='250g'
        color='#ffd93d'
      />
      <MacroCard
        label='الدهون'
        value={`${totals.fat}g`}
        goal='65g'
        color='#6bcb77'
      />
    </View>
  );
}
const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    }
})
