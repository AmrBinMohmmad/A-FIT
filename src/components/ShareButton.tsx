import { Meal } from '@/storage/meals';
import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { Share, StyleSheet, TouchableOpacity } from 'react-native';


type ShareButtonProps = {
    meals: Meal[];
}

export default function ShareButton({meals}:ShareButtonProps) {
    const handleShare = async() => {
        const totals = meals.reduce(
            (acc,meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fat: acc.fat + meal.fat,
            }),
             { calories: 0, protein: 0, carbs: 0, fat: 0 },
        );
        const today = new Date().toLocaleDateString('ar-SA');
        await Share.share({
            message: ` ملخص تغذيتي في يوم ${today} تطبيق أي-فيت\n\n السعرات الحرارية: ${totals.calories} سعرة\n البروتين: ${totals.protein} غ\n الكربوهيدرات: ${totals.carbs} غ\n الدهون: ${totals.fat} غ\n\n عدد الوجبات المسجلة: ${meals.length} وجبة`,
        });
    };
       return (
        <TouchableOpacity onPress={handleShare}>
            <Ionicons style={styles.button} name="share-social" size={24} color={colors.primary} />
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
  button: {    
        alignSelf: 'flex-start',
        marginLeft: 'auto',
  },
});