import {View, Text} from 'react-native';
import {icons} from "@/constants/icons";
import {SafeAreaView} from "react-native-safe-area-context";

export default function Discover() {
    return (
        <SafeAreaView className="bg-offwhite flex-1">
            <View className="px-4 pt-4 flex-1">
                <Text className="font-baloo-regular text-accent">Discover</Text>
            </View>
        </SafeAreaView>
    );
}