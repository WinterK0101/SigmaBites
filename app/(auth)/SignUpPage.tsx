import { Text, StyleSheet, TextInput, TouchableOpacity, Image, SafeAreaView, View } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential) {
        router.replace('/StartupScreen'); 
      }
    } catch (error: any) {
      console.log(error);
      alert('Sign up failed: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cloudWrapper}>
        <View style={styles.cloudCircle1} />
        <View style={styles.cloudCircle2} />
      </View>

      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.profilePicPlaceholder}>
        <Text style={styles.profilePicText}>Add a profile{'\n'}picture</Text>
      </View>

      <View style={styles.centerAlign}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.textInput}
          placeholder="username"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.signUpButton} onPress={signUp}>
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

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
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
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
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Baloo-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  profilePicPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  profilePicText: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
  },
  centerAlign: {
    alignItems: 'center',
  },
  textInput: {
    height: 48,
    width: '80%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  signUpButton: {
    width: '80%',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FE724C',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
