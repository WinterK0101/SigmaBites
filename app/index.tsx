import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import {images} from '@/constants/images';

export default function StartPage() {
  return (
      <ImageBackground
          source={images.primarybg}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Sigma Bites</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('(auth)/SignInPage')}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('(auth)/SignUpPage')}>
              <Text style={styles.linkText}>Create an account</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  logoContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -24 }],
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  logo: {
    fontSize: 48,
    color: 'white',
    fontFamily: 'Baloo-Regular',
    textShadowColor: 'rgba(129, 52, 42, 1)',
    textShadowOffset: { width: 3, height: 4 },
    textShadowRadius: 0,
    textAlign: 'center',
  },

  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 200,
  },

  buttonText: {
    color: '#FE724C',
    fontSize: 20,
    fontFamily: 'Baloo-Regular',
    textAlign: 'center',
  },

  linkText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Baloo-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },

});