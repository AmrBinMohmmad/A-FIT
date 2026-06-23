import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { deleteMeal } from '@/storage/meals';
import { colors } from '@/styles/global';

type MealItemProps = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onDelete: () => void;
};

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  onDelete,
}: MealItemProps) {
  const handleLongPress = () => {
    Alert.alert('حذف وجبة', `هل انت متأكد من حذف وجبة "${name}"?`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(id);
          onDelete();
        },
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onLongPress={handleLongPress}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.macros}>
        {calories} سعرة • {protein}غ بروتين • {carbs}غ كارب • {fat}غ دهون
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  macros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});