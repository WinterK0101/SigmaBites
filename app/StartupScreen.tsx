import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';

import bgImage from '../assets/images/background.png'; 

export default function StartupScreen() {
  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.greeting}>Hello, John!</Text>
        <Image
          source={{ uri: 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg' }}
          style={styles.avatar}
        />
        <Text style={styles.prompt}>What would you like to eat?</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    background: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // Optional dark overlay
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
      borderWidth: 2,
      borderColor: '#EEA191',
    },
    prompt: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    marginBottom: 100,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    },
  });
  