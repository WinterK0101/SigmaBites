// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
//import { FB_APIKEY, FB_AUTHDOMAIN, FB_PROJECTID, FB_STORAGEBUCKET, FB_MESSAGINGSENDERID, FB_APPID} from '@env';
//import Config from 'react-native-config';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGEBUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_FB_APPID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});