import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';

// ✅ 1. Define the Friend type
type Friend = {
  id: string;
  name: string;
  restaurant: string;
  date: string;
  image: ImageSourcePropType;
};

// ✅ 2. Type the array correctly
const friends: Friend[] = [
  {
    id: '1',
    name: 'bubblegumprincess',
    restaurant: "Sally's",
    date: '1 day ago',
    image: require('../../assets/images/personA.png'),
  },
  {
    id: '2',
    name: 'johnnie',
    restaurant: 'Cafe Margaret',
    date: '4 days ago',
    image: require('../../assets/images/personB.png'),
  },
  {
    id: '3',
    name: 'corpseking',
    restaurant: 'Project Acai',
    date: '2 days ago',
    image: require('../../assets/images/personC.png'),
  },
];

export default function FriendsScreen() {
  // ✅ 3. Type the item in renderItem
  const renderItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <Image source={item.image} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.saved}>
          Saved <Text style={styles.restaurant}>{item.restaurant}</Text> {item.date}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Friends</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Friends</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>3 Friends</Text>

      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B3E',
  },
  addButton: {
    backgroundColor: '#FF6B3E',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  subHeader: {
    color: '#888',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 100, // Leave space for tab bar
  },
  friendCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  saved: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  restaurant: {
    color: '#FF6B3E',
  },
});
