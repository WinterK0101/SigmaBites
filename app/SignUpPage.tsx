import { Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, View } from 'react-native';
import React, { useState, useEffect } from 'react';
//import { auth } from '../FirebaseConfig';
//import { createUserWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { supabase } from '../SupabaseConfig';
import * as ImagePicker from 'expo-image-picker'

interface Props {
  size: number
  url: string | null
  onUpload: (filePath: string) => void
}

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function signUpWithEmail() {
    const { data: { session }, error,} = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    if (session)
    {
      const updateUsername = {
        id: session?.user.id,
        username: username,
        name: username,
        updated_at: new Date(),
        //avatar_url: path
      }
      const {error} = await supabase.from('profiles').upsert(updateUsername)
      if (error){
        Alert.alert(error.message)
      }
      router.push('/(tabs)/Discover')
    }
      
  }

  async function uploadAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to only images
        allowsMultipleSelection: false, // Can only select one image
        allowsEditing: true, // Allows the user to crop / rotate their photo before uploading it
        quality: 1,
        exif: false, // We don't want nor need that data.
      })
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.')
        return
      }
      const image = result.assets[0]
      console.log('Got image', image)
      if (!image.uri) {
        throw new Error('No image uri!') // Realistically, this should never happen, but just in case...
      }
      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())
      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        })
      if (uploadError) {
        Alert.alert(uploadError.message)
      }

  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cloudWrapper} >
        <View style={styles.cloudCircle1} />
        <View style={styles.cloudCircle2} />
      </View>

      <Text style={styles.title}>Sign Up</Text>
    
      <TouchableOpacity style={styles.profilePicPlaceholder} onPress={uploadAvatar}>
        <Text style={styles.profilePicText}>Add a profile{'\n'}picture</Text>
      </TouchableOpacity>  

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

        <TouchableOpacity style={styles.signUpButton} onPress={signUpWithEmail}>
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
