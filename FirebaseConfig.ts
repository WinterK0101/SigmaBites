// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzSkypMPjZ6GzaSCRg953G5MYwUwYHPyw",
  authDomain: "sigmabites-90e1e.firebaseapp.com",
  projectId: "sigmabites-90e1e",
  storageBucket: "sigmabites-90e1e.firebasestorage.app",
  messagingSenderId: "238491527811",
  appId: "1:238491527811:web:f2483cc12f172f6e2c89b6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});