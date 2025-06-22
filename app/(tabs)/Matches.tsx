import { View, Text, FlatList, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from 'react';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';

const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 2;

export default function Matches() {
  const [products, setProducts] = useState(Array<any>);
  const session = useSession();
  const eateries: Array<any> = [];
  const retrieveProfile = async () =>{
    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from('profiles')
        .select('liked_eateries')
        .eq('id', session?.user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }
      for (let index = 0; index < fetchedData.liked_eateries.length; index++) {
        const element = fetchedData.liked_eateries[index];
        console.log(index + fetchedData.liked_eateries[index])
        console.log(element)
        const {data: currEatery} = await supabase
          .from("Eatery")
          .select("*")
          .eq("placeId", element)
          .single()

        console.log(currEatery.displayName)
        console.log(currEatery.photo)
        eateries.push(
          {
            id:element,
            name:currEatery.displayName,
            restaurant: "2km",
            image:currEatery.photo
          }
        )
        console.log(eateries)
        setProducts(eateries);
      }
    } catch (err) {
      console.log(err.message)
    }
  }
  
  useEffect(() => {
    retrieveProfile();
  }, []);

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
                    <View style={styles.overlay} />
                    <View style={styles.textContainer}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.restaurant}>{item.restaurant}</Text>
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
});