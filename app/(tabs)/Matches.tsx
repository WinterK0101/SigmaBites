import { View, Text, FlatList, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback, useRef  } from 'react';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';
import { calculateDistance } from '@/services/apiDetailsForUI'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import ConfirmationModal from "@/components/ConfirmationModal";

const { width, height } = Dimensions.get('window');

// To get location
const getLocation = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('userLocation');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to fetch location');
  }
};

const seeDetails = (item : any) =>{
  console.log(item)
  router.push({
    pathname:'/(modals)/RestaurantDetails',
    params:{
      placeId: item.id,
      eatery: JSON.stringify(item)
    }
  });
}

// Eatery cards with animations
const AnimatedCard = ({ item, isEditMode, setIsEditMode, seeDetails, onRemove }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const longPressTimer = useRef(null);
  const hasLongPressed = useRef(false);

  const handlePressIn = () => {
    hasLongPressed.current = false;

    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();

    longPressTimer.current = setTimeout(() => {
      hasLongPressed.current = true;
      setIsEditMode(!isEditMode);
    }, 500);
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePress = () => {
    // Only navigate if it wasn't a long press and not in edit mode
    if (!hasLongPressed.current && !isEditMode) {
      seeDetails(item);
    }
  };


  return (
      <Animated.View
          style={{
            width: (width - 48) / 2,
            height: height * 0.25,
            transform: [{ scale: scaleAnim }]
          }}
          className="rounded-xl mb-4"
      >
        <ImageBackground
            source={{ uri: item.image }}
            className="flex-1 rounded-xl border-2 border-accent overflow-hidden relative"
            imageStyle={{ resizeMode: 'cover' }}
        >
          <TouchableOpacity
              className="absolute inset-0 bg-transparent z-20"
              activeOpacity={1}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handlePress}
          />

          <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(102,51,25,0.8)']}
              locations={[0, 0.6, 1]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 12,
                zIndex: 5,
              }}
          />

          {isEditMode && (
              <TouchableOpacity
                  className="absolute top-2 left-2 w-8 h-8 bg-accent rounded-full items-center justify-center z-30 border-2 border-white"
                  onPress={() => onRemove(item)}
              >
                <MaterialCommunityIcons name="trash-can-outline" color="white" size={20}/>
              </TouchableOpacity>
          )}

          <View className="absolute bottom-3 left-3 z-10" style={{ maxWidth: ((width - 48) / 2) * 0.8 }}>
            <Text
                className="text-white text-base font-lexend-bold text-left"
                numberOfLines={2}
                ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <Text className="text-gray-200 text-sm font-lexend-regular text-left">{item.distance}</Text>
          </View>
        </ImageBackground>
      </Animated.View>
  );
};

export default function Matches() {
  const [products, setProducts] = useState<Array<any>>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<any>(null);
  const session = useSession();

  useFocusEffect(
      useCallback(() => {
        const fetchData = async () => {
          if (products.length > 0) return;

          try {
            const { data: fetchedData, error: fetchError } = await supabase
                .from('profiles')
                .select('liked_eateries')
                .eq('id', session?.user.id)
                .single();

            if (fetchError) throw fetchError;

            const eateries = await Promise.all(
                fetchedData.liked_eateries.map(async (element: string) => {
                  const { data: currEatery } = await supabase
                      .from("Eatery")
                      .select("*")
                      .eq("placeId", element)
                      .single();

                  const currentLocation = await getLocation();
                  const dist = calculateDistance(
                      currentLocation.latitude,
                      currentLocation.longitude,
                      currEatery.location.latitude,
                      currEatery.location.longitude
                  );

                  return {
                    id: element,
                    name: currEatery.displayName,
                    distance: `${dist.toFixed(2)} km`,
                    image: currEatery.photo
                  };
                })
            );

            setProducts(eateries);
          } catch (err) {
            console.error(err);
          }
        };

        fetchData();
      }, [products.length, session?.user.id])
  );

  const handleRemoveItem = (item) => {
    setItemToRemove(item);
    setShowConfirmModal(true);
  };

  const cancelRemove = () => {
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  const confirmRemove = () => {
    //TODO: IMPLEMENT!!!
  }

  return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-4 pt-8">
          <Text className="font-baloo-regular text-accent text-4xl py-4">Match History</Text>
        </View>
        <View className="flex-grow">
          <FlatList
              key={'2-columns'}
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                  <AnimatedCard
                      item={item}
                      isEditMode={isEditMode}
                      setIsEditMode={setIsEditMode}
                      seeDetails={seeDetails}
                      onRemove={handleRemoveItem}
                  />
              )}
          />
          <ConfirmationModal
              visible={showConfirmModal}
              title="Remove Restaurant"
              message={`Are you sure you want to remove "${itemToRemove?.name}" from your likes?`}
              confirmText="Remove"
              cancelText="Cancel"
              onConfirm={confirmRemove}
              onCancel={cancelRemove}
          />
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});