import { Text, StyleSheet, TextInput, TouchableOpacity, Image, SafeAreaView, View } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace('/(tabs)');
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cloudWrapper}>
        <View style={styles.cloudCircle1} />
        <View style={styles.cloudCircle2} />
      </View>


      <Text style={styles.title}>Sign In</Text>
      
      <View style={styles.centerAlign}>
      <TouchableOpacity style={styles.googleButton}>
        <View style={styles.googleButtonContent}>
        <Image 
          source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} 
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </View>
      </TouchableOpacity>

      </View>

      <View style={styles.centerAlign}>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>
        <Text style={styles.inputLabel}>Username or Email</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder="Username or Email" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry
        />
      
      
      <TouchableOpacity style={styles.signInButton} onPress={signIn}>
        <Text style={styles.signInButtonText}>Sign in</Text>
      </TouchableOpacity>
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
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 140,
    textAlign: 'center',
    color: 'white',
  },
  googleButton: {
    width: '80%',
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FE724C',
  },
  googleButtonText: {
    color: '#FE724C',
    fontSize: 18,
    fontWeight: '600',
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
  signInButton: {
    width: '80%',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FE724C',
    alignItems: 'center',
    marginTop: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  centerAlign: {
    alignItems: 'center',
  },  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  
});