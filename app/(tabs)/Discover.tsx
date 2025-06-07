import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import {icons} from "@/constants/icons";
import {SafeAreaView} from "react-native-safe-area-context";
import LocationSearch from "@/components/LocationSearch";
import {LocationDisplay} from "@/components/LocationDisplay";

export default function Discover() {
    return (
        <SafeAreaView className="bg-offwhite flex-1">
            <View className="px-4 pt-8 flex-1">
                <Text className="font-baloo-regular text-accent text-4xl py-4">Discover</Text>
                <LocationSearch/>
                <LocationDisplay/>
            </View>
        </SafeAreaView>
    );
}