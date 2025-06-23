import { Text, StyleSheet, TextInput, TouchableOpacity, Image, SafeAreaView, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/SupabaseConfig';

const SignInScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function signInWithEmail() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) {
      Alert.alert(error.message)
    } else {
      router.replace('/(auth)/StartupScreen')
    }
  }

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cloudWrapper}>
          <View style={styles.cloudCircle1} />
          <View style={styles.cloudCircle2} />
        </View>

        <Text style={styles.title}>Sign In</Text>

        <View style={styles.centerAlign}>
          {/* Google sign-in removed */}
        </View>

        <View style={styles.centerAlign}>
          {/* ---or--- divider removed */}

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
          />

          <TouchableOpacity style={styles.signInButton} onPress={signInWithEmail}>
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={()=>router.replace('/(auth)/SignUpPage')}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  cloudWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
    overflow: 'hidden',
  },
  cloudCircle1: {
    position: 'absolute',
    width: 350,
    height: 300,
    borderRadius: 200,
    backgroundColor: '#FE724C',
    top: -60,
    left: -70,
  },
  cloudCircle2: {
    position: 'absolute',
    width: 260,
    height: 220,
    borderRadius: 120,
    backgroundColor: '#FE724C',
    top: -30,
    left: 180,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    marginBottom: 160,
    marginTop: -180,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Baloo-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 45,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#FE724C',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#FE724C',
    fontFamily: 'Lexend-Regular',
  },
  inputLabel: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
    fontFamily: 'Lexend-Bold',
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },
  textInput: {
    height: 52,
    width: '80%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  signInButton: {
    width: '80%',
    padding: 16,
    borderRadius: 25,
    backgroundColor: '#FE724C',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FE724C',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
  },
  centerAlign: {
    alignItems: 'center',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  signUpLink: {
    color: '#FE724C',
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
  },
});