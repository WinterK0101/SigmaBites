import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function StartPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>Sigma Bites</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/SignInPage')}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/SignUpPage')}>
        <Text style={styles.linkText}>Create an account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FE724C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 60,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FE724C',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
