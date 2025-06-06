import {View, Text} from 'react-native';
import {icons} from "@/constants/icons";
import {SafeAreaView} from "react-native-safe-area-context";
import LocationSearch from "@/app/(tabs)/LocationSearch";

export default function Discover() {
    return (
        <SafeAreaView className="bg-offwhite flex-1">
            <View className="px-4 pt-8 flex-1">
                <Text className="font-baloo-regular text-accent text-4xl py-4">Discover</Text>
                <LocationSearch/>
            </View>
        </SafeAreaView>
    );
}