import { View, Text, FlatList, StyleSheet, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useCallback  } from 'react';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';
import { calculateDistance } from '../../services/apiDetailsForUI'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
//import { opacity } from 'react-native-reanimated/lib/typescript/Colors';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 2;

// To get location
const getLocation = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('userLocation');
    //return jsonValue
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

/* const test = useCallback(() => {
        const currentEatery = eateries[currentIndex];
        if (!currentEatery) return;
        router.push({
            pathname: "/RestaurantDetails",
            params: {
                placeId: currentEatery.placeId,
                eatery: JSON.stringify(currentEatery),
            },
        });
    }, [eateries, currentIndex, router]); */

export default function Matches() {
  const [products, setProducts] = useState<Array<any>>([]);
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
    }, [products.length, session?.user.id]) // Proper dependencies
  );


  return (
      <SafeAreaView style={styles.container}>
        <View className="px-4 pt-8">
          <Text className="font-baloo-regular text-accent text-4xl py-4">Match History</Text>
        </View>

        <FlatList
            key={'2-columns'}
            data={products}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
                <View style={[styles.matchItem, { width: itemSize }]}>
                  <ImageBackground
                      source={{ uri: item.image }}
                      style={styles.imageBackground}
                      imageStyle={styles.imageStyle}
                    >
                      {/* Invisible but clickable overlay */}
                      <TouchableOpacity 
                        style={styles.invisibleTouchable}
                        activeOpacity={1} // No visual feedback on press
                        onPress={() => seeDetails(item)}
                      />
                      
                      {/* Your visible content stays separate */}
                      <View style={styles.overlay} />
                      <View style={styles.textContainer}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.restaurant}>{item.distance}</Text>
                      </View>    
                  </ImageBackground>
                </View>
            )}
            contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  matchItem: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 160,
    backgroundColor: '#ccc',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FE724C',
    overflow: 'hidden',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)', // dim effect
  },
  textContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  restaurant: {
    fontSize: 14,
    color: '#ddd',
    textAlign: 'center',
  },
  invisibleTouchable: {
    ...StyleSheet.absoluteFillObject, // Covers entire parent
    backgroundColor: 'transparent',
    zIndex: 1, // Ensures it's above the image but below content
  },
});