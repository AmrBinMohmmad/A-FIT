import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import ShareButton from '@/components/ShareButton';
import { getMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';

export default function HomeScreen(){
  const [meals,setMeals] = useState<Meal[]>([])
  const tabBarHeight = useBottomTabBarHeight();

  const loadMeals = async() => {
    const data = await getMeals();
    setMeals(data);
    console.log('جلب الوجبات:', data);
  }

  useFocusEffect(
    useCallback(() =>{
      loadMeals()
    },[]))

return (
  <ScrollView 
    style={globalStyles.container} 
    contentContainerStyle={{ paddingBottom: tabBarHeight + 10 }}
  >
    <View style={{
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5, 
      paddingHorizontal: 4 
    }}>
      <Text style={[globalStyles.title, { alignSelf: 'auto', marginBottom: 0 }]}>
        أي-فيت
      </Text>
      <ShareButton meals={meals} />
    </View>
    <HomeHeader />
    <MacroGrid meals={meals} />
    <RecentMeals meals={meals} onDelete={loadMeals} />
    
  </ScrollView>
);
}

