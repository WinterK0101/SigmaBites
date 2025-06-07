import {View, Text, TextInput, Keyboard, FlatList, TouchableOpacity} from 'react-native'
import React, {useState, useCallback} from 'react'
import {icons} from "@/constants/icons";
import {debouncedLocationSearch} from "@/services/locationService";

export default function LocationSearch({onLocationSelect}) {
    const [displayText, setDisplayText] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPredictions, setShowPredictions] = useState(false);

    // Create a stable debounced function using useCallback
    const debouncedSearch = useCallback(
        debouncedLocationSearch,
        []
    );

    const handleTextChange = (newText: string) => {
        setDisplayText(newText);

        if (newText.length === 0) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        if (newText.length >= 3) {
            setShowPredictions(true);
            debouncedSearch(newText, setPredictions, setIsLoading);
        } else {
            setShowPredictions(false);
            setPredictions([]);
        }
    }

    const handleSelectLocation = (prediction) => {
        setDisplayText(prediction.description);
        setShowPredictions(false);
        setPredictions([]);
        Keyboard.dismiss();
        if (onLocationSelect) {
            onLocationSelect(prediction);
        }
    }

    const renderPrediction = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleSelectLocation(item)}
            className="px-4 py-3 border-b border-gray-200"
        >
            <Text className="font-lexend-regular text-xs text-primary">{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="relative">
            <View className="flex-row items-center bg-grey rounded-2xl px-5 py-4">
                <icons.search height={20} width={20} stroke={"#6c6c6c"}/>
                <TextInput
                    placeholder={"Enter a location"}
                    onChangeText={handleTextChange}
                    className="ml-3 flex-1 text-6c6c6c font-lexend-regular"
                    clearButtonMode={"while-editing"}
                    value={displayText}
                    onFocus={() => {
                        if (predictions.length > 0) {
                            setShowPredictions(true);
                        }
                    }}
                />
                {isLoading && (
                    <Text className="text-gray-500 text-sm">Loading...</Text>
                )}
            </View>

            {showPredictions && predictions.length > 0 && (
                <View className="absolute top-full left-0 right-0 bg-white rounded-lg border border-gray-200 mt-1.5 z-10">
                    <FlatList
                        data={predictions}
                        renderItem={renderPrediction}
                        keyExtractor={(item) => item.place_id}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
        </View>
    )
}