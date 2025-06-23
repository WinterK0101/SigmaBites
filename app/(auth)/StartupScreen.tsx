import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Animated, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import { useSession } from "@/context/SessionContext";
import { fetchUserByID } from "@/services/userService";
import RemoteImage from "@/components/RemoteImage";
import { User } from "@/interfaces/interfaces";

export default function StartupScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { session } = useSession();
  const user = session?.user;
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleTap = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      router.replace('/(tabs)/Discover');
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        try {
          const userData = await fetchUserByID(user.id);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };

    fetchUser();

    const timer = setTimeout(() => {
      handleTap();
    }, 10000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  return (
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <ImageBackground
              source={images.primarybg}
              style={styles.background}
              resizeMode="cover"
          >
            <View style={styles.overlay}>
              <Text style={styles.greeting}>
                Hello, {currentUser?.name}!
              </Text>
              <RemoteImage
                  filePath={currentUser?.avatar_url}
                  bucket="avatars"
                  style={styles.avatar}
              />
              <Text style={styles.prompt}>What would you like to eat?</Text>
              <Text style={styles.tapHint}>Tap anywhere to continue to the app!</Text>
            </View>
          </ImageBackground>
        </Animated.View>
      </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
    color: 'white',
    fontSize: 40,
    fontFamily: 'Baloo-Regular',
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  avatar: {
    width: 250,
    height: 250,
    borderRadius: 125,
    marginBottom: 30,
    borderWidth: 4,
    borderColor: 'white',
  },
  prompt: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  tapHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    marginBottom: 100,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});