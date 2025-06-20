import { Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, View } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/SupabaseConfig';
import * as ImagePicker from 'expo-image-picker';
import RemoteImage from '@/components/RemoteImage';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  async function signUpWithEmail() {
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      return;
    }

    if (session) {
      // Use avatarPath if set, else fallback to default-profile.png
      const avatarToSave = avatarPath ? avatarPath : 'default-profile.png';

      const updateUsername = {
        id: session.user.id,
        username: username,
        name: displayName,
        updated_at: new Date(),
        avatar_url: avatarToSave,
      };

      const { error: profileError } = await supabase
          .from('profiles')
          .upsert(updateUsername);

      if (profileError) {
        Alert.alert(profileError.message);
        console.log(profileError.message);
      } else {
        router.replace('/(tabs)/Discover');
      }
    }
  }

  async function uploadAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      quality: 1,
      exif: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log('User cancelled image picker.');
      return;
    }

    const image = result.assets[0];
    const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
    const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
    const path = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

    if (uploadError) {
      Alert.alert(uploadError.message);
      return;
    }
    setAvatarPath(path);
    console.log("Avatar uploaded with path:", path);
  }

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cloudWrapper}>
          <View style={styles.cloudCircle1} />
          <View style={styles.cloudCircle2} />
        </View>

        <Text style={styles.title}>Sign Up</Text>

        {avatarPath ? (
            <TouchableOpacity onPress={uploadAvatar} style={styles.profilePicContainer}>
              <RemoteImage
                  filePath={avatarPath}
                  bucket="avatars"
                  style={styles.profilePicImage}
                  expiresIn={3600} // 1 hour
              />
            </TouchableOpacity>
        ) : (
            <TouchableOpacity style={styles.profilePicPlaceholder} onPress={uploadAvatar}>
              <Text style={styles.profilePicText}>Add profile{'\n'}picture</Text>
            </TouchableOpacity>
        )}

        <View style={styles.centerAlign}>
          <Text style={styles.inputLabel}>Display Name</Text>
          <TextInput
              style={styles.textInput}
              placeholder="Enter your display name"
              value={displayName}
              onChangeText={setDisplayName}
          />

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
              style={styles.textInput}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
          />

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

          <TouchableOpacity style={styles.signUpButton} onPress={signUpWithEmail}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={()=>router.replace('/(auth)/SignUpPage')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 25,
    marginTop: -30,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Baloo-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profilePicText: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Lexend-Regular',
  },
  profilePicContainer: {
    alignSelf: 'center',
    marginBottom: 25,
  },
  profilePicImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  centerAlign: {
    alignItems: 'center',
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
    height: 48,
    width: '80%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
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
  signUpButton: {
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
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signInText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  signInLink: {
    color: '#FE724C',
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
  },
});