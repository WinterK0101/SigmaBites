import { View, Text, FlatList, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback, useRef } from 'react';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';
import { calculateDistance } from '@/services/apiDetailsForUI'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ConfirmationModal from "@/components/ConfirmationModal";
import { addToFavorites, removeFromFavorites, toggleFavorite } from '@/services/favouriteService';

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

const seeDetails = (item : any) => {
    console.log(item)
    router.push({
        pathname: '/(modals)/RestaurantDetails',
        params: {
            placeId: item.id,
            eatery: JSON.stringify(item)
        }
    });
}

// Eatery cards with animations
const AnimatedCard = ({
                          item,
                          isEditMode,
                          setIsEditMode,
                          seeDetails,
                          onRemove,
                          favorites,
                          onFavoritePress
                      }) => {
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

    const isFavourited = favorites.includes(item.id);

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

                {/* For delete */}
                {isEditMode && (
                    <TouchableOpacity
                        className="absolute top-2 left-2 w-8 h-8 bg-accent rounded-full items-center justify-center z-30 border-2 border-white"
                        onPress={() => onRemove(item)}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" color="white" size={20} />
                    </TouchableOpacity>
                )}

                {/* For favouriting */}
                {!isEditMode && (
                    <TouchableOpacity
                        className="absolute top-2 right-2 w-8 h-8 bg-accent rounded-full items-center justify-center z-30 border-2 border-white"
                        onPress={() => onFavoritePress(item)}
                    >
                        <MaterialCommunityIcons
                            name={isFavourited ? "heart" : "heart-outline"}
                            color="white"
                            size={16}
                        />
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
    const [products, setProducts] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);
    const [showFavouriteConfirm, setShowFavouriteConfirm] = useState(false);
    const [itemToFavorite, setItemToFavorite] = useState(null);
    const session = useSession();

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (products.length > 0) return;

                try {
                    const { data: fetchedData, error: fetchError } = await supabase
                        .from('profiles')
                        .select('liked_eateries, favourite_eateries')
                        .eq('id', session?.user.id)
                        .single();

                    if (fetchError) throw fetchError;

                    const favoriteEateries = fetchedData.favourite_eateries || [];
                    setFavourites(favoriteEateries);

                    const eateries = await Promise.all(
                        fetchedData.liked_eateries.map(async (element) => {
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

    const handleRemoveItem = (item : any) => {
        setItemToRemove(item);
        setShowConfirmModal(true);
    };

    const cancelRemove = () => {
        setShowConfirmModal(false);
        setItemToRemove(null);
    };

    const confirmRemove = async () => {
        //TODO: Implement removal!!!
        setShowConfirmModal(false);
        setItemToRemove(null);

        async () => {
          const userId = session?.user.id;
            // 1. Fetch current liked_eateries
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('favourite_eateries')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError.message);
            } else {
                let favouriteEateriesArr = Array.isArray(profileData?.favourite_eateries)
                    ? profileData.favourite_eateries
                    : [];
                // 2. Add placeId if not already present
                if (favouriteEateriesArr.includes(itemToRemove.placeId)) {
                    const index = favouriteEateriesArr.indexOf(itemToRemove.placeId)
                    favouriteEateriesArr.splice(index, 1)
                    // 3. Update the profile
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ favourite_eateries: favouriteEateriesArr })
                        .eq('id', userId);
                    if (updateError) {
                        console.error('Error updating favourite_eateries:', updateError.message);
                    }
                }
            }
        }
    };

    const handleFavoritePress = (item : any) => {
        setItemToFavorite(item);
        setShowFavouriteConfirm(true);
    };

    const confirmFavoriteToggle = async () => {
        if (!itemToFavorite) return;

        try {
            const { updatedFavorites, wasAdded } = await toggleFavorite(
                session?.user.id,
                itemToFavorite.id,
                favourites
            );

            setFavourites(updatedFavorites);

            async () => {
              // Get current user id
              const userId = session?.user.id;
                  // 1. Fetch current liked_eateries
                  const { data: profileData, error: profileError } = await supabase
                      .from('profiles')
                      .select('favourite_eateries')
                      .eq('id', userId)
                      .single();

                  if (profileError) {
                      console.error('Error fetching profile:', profileError.message);
                  } else {
                      let favouriteEateriesArr = Array.isArray(profileData?.favourite_eateries)
                          ? profileData.favourite_eateries
                          : [];
                      // 2. Add placeId if not already present
                      if (!favouriteEateriesArr.includes(itemToFavorite.placeId)) {
                          favouriteEateriesArr = [...favouriteEateriesArr, itemToFavorite.placeId];
                          // 3. Update the profile
                          const { error: updateError } = await supabase
                              .from('profiles')
                              .update({ favourite_eateries: favouriteEateriesArr })
                              .eq('id', userId);
                          if (updateError) {
                              console.error('Error updating favourite_eateries:', updateError.message);
                          }
                      }
                  }
            }
            // Optional: Show success message
            console.log(wasAdded ? 'Added to favorites' : 'Removed from favorites');

        } catch (error) {
            console.error('Error toggling favorite:', error);
            // You might want to show an error toast here
        } finally {
            setShowFavouriteConfirm(false);
            setItemToFavorite(null);
        }
    };

    const cancelFavoriteToggle = () => {
        setShowFavouriteConfirm(false);
        setItemToFavorite(null);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 pt-8 flex-row justify-between">
                <Text className="font-baloo-regular text-accent text-4xl py-4">Match History</Text>
                <TouchableOpacity
                    className="bg-accent rounded-full mr-3 w-10 h-10 mt-2 justify-center items-center"
                    onPress={() => setIsEditMode(!isEditMode)}
                >
                    <MaterialCommunityIcons name="pencil" size={20} color="white" />
                </TouchableOpacity>
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
                            favorites={favourites}
                            onFavoritePress={handleFavoritePress}
                        />
                    )}
                />

                {/* Remove Confirmation Modal */}
                <ConfirmationModal
                    visible={showConfirmModal}
                    title="Remove Restaurant"
                    message={`Are you sure you want to remove "${itemToRemove?.name}" from your likes?`}
                    confirmText="Remove"
                    cancelText="Cancel"
                    onConfirm={confirmRemove}
                    onCancel={cancelRemove}
                />

                {/* Favorite Confirmation Modal */}
                <ConfirmationModal
                    visible={showFavouriteConfirm}
                    title={
                        itemToFavorite && favourites.includes(itemToFavorite.id)
                            ? "Remove from Favorites"
                            : "Add to Favorites"
                    }
                    message={
                        itemToFavorite && favourites.includes(itemToFavorite.id)
                            ? `Remove "${itemToFavorite?.name}" from your favorites?`
                            : `Add "${itemToFavorite?.name}" to your favorites?`
                    }
                    confirmText={
                        itemToFavorite && favourites.includes(itemToFavorite.id)
                            ? "Remove"
                            : "Add"
                    }
                    cancelText="Cancel"
                    onConfirm={confirmFavoriteToggle}
                    onCancel={cancelFavoriteToggle}
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