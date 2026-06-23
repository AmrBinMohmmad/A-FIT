import { globalStyles } from "@/styles/global";
import { Text, View } from "react-native";

export default function HomeHeader() {
const currentDate =new Date().toLocaleDateString('ar-EG-u-nu-latn', {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});   

    return (
        <View style={globalStyles.header}>
            <Text style={globalStyles.date}>{currentDate}</Text>
        </View>
    )

}