import { View, Text, FlatList, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const matchHistoryData = [
  { id: '1', name: 'Ajisen Ramen', restaurant: '12.0km', image: 'https://ucarecdn.com/14373564-94e1-48f6-bcd5-a99767cbc5f2/-/crop/1867x777/0,294/-/format/auto/-/resize/1024x/' },
  { id: '2', name: 'Pepper Lunch', restaurant: '1.6km', image: 'https://moribyan.com/wp-content/uploads/2023/10/Pepper-Lunch-683x1024.jpg' },
  { id: '3', name: 'Tsukimi Hamburg', restaurant: '2.4km', image: 'https://www.hougangmall.com.sg/content/dam/frasersexperience/hm/store-logos/HM_TsukimiHamburg_Lifestyle4.png' },
  { id: '4', name: "Josh's Grill", restaurant: '10.0km', image: 'https://www.capitaland.com/sg/malls/bugisjunction/en/stores/josh-s-grill/_jcr_content/root/container/container/entitydetails.coreimg.jpeg/content/dam/capitaland-sites/singapore/shop/malls/bugis-junction/tenants/Josh%27s%20Grill%20-%20Sirloin%20Beef%20.jpg' },
  { id: '5', name: 'Marché', restaurant: '0.2km', image: 'https://media.marche-restaurants.com/karmarun//image/upload/q_60,w_400,h_400,c_fill/marche/YaB6HYYZe-Prawn%20Bisque%20Pasta%20square.png' },
  { id: '6', name: 'Ichiban Sushi', restaurant: '23.1km', image: 'https://businessfocusmagazine.com/wp-content/uploads/2024/04/Ich1.png' },
  { id: '7', name: "Mcdonald's", restaurant: '3.6km', image: 'https://www.eatthis.com/wp-content/uploads/sites/4/2018/02/mcdonalds-double-quarter-pounder-with-cheese.jpg?quality=82&strip=all' },
  { id: '8', name: 'Pastamania', restaurant: '2.5km', image: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/AS/chains/cwc_pastamania_sg/c492a27f116d0801dd21ca99fe615b6c.jpg?width=%s' },
  { id: '9', name: 'KFC', restaurant: '1.3km', image: 'https://www.hypresslive.com/wp-content/uploads/2021/02/KFC-SPicy-CHips-2.png' },
  { id: '10', name: "Lola's Cafe", restaurant: '8.88kkm', image: 'https://gurkhason.wordpress.com/wp-content/uploads/2014/06/lolas-cafe-flat-white-5.jpg' },
];


const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 2;

export default function Matches() {
  return (
    <SafeAreaView style={styles.container}>
      <View className="px-4 pt-8">
        <Text className="font-baloo-regular text-accent text-4xl py-4">Match History</Text>
      </View>

      <FlatList
        key={'2-columns'}
        data={matchHistoryData}
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
    backgroundColor: '#fff',
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
