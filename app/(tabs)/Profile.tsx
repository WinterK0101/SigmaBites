import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function Profile() {
  return (
    <ScrollView style={styles.container}>
      {/* Top gradient header */}
      <LinearGradient colors={['#FF4D4D', '#FF8855']} style={styles.header}>
        <Image
          source={{
            uri: 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
          }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Text style={styles.editIconText}>✏️</Text>
        </TouchableOpacity>

        <Text style={styles.name}>John</Text>
        <Text style={styles.username}>@username</Text>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Restaurants</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Recently Saved */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Saved</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Ajisen Ramen', 'Project Acai', 'Sally’s'].map((name, index) => (
            <View key={index} style={styles.item}>
              <Image
                source={{
                  uri: 'https://source.unsplash.com/80x80/?food' + index,
                }}
                style={styles.itemImage}
              />
              <Text style={styles.itemLabel}>{name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Favourites */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favourites</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Ajisen Ramen', '18Chefs', 'Tsuk'].map((name, index) => (
            <View key={index} style={styles.item}>
              <Image
                source={{
                  uri: 'https://source.unsplash.com/100x100/?dinner' + index,
                }}
                style={styles.itemImageLarge}
              />
              <Text style={styles.itemLabel}>{name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    overflow: 'hidden', 
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    top: 90,
    right: 130,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  editIconText: {
    fontSize: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  username: {
    color: '#fff',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginVertical: 10,
  },
  editButtonText: {
    color: '#FE724C',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 50,
    marginTop: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    marginRight: 16,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  itemImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
