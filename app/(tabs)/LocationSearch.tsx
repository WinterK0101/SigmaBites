import {View, Text, TextInput} from 'react-native'
import React from 'react'
import {icons} from "@/constants/icons";

export default function LocationSearch() {
    return (
        <View className="flex-row items-center bg-grey rounded-2xl px-5 py-4">
            <icons.search height={20} width={20} stroke={"#6c6c6c"}/>
            <TextInput
                onPress={()=>{}}
                placeholder={"Enter a location"}
                onChangeText={(text) => {}}
                className="ml-2 flex-1 text-6c6c6c"
            />
        </View>
    )
}
