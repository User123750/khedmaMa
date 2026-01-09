// src/config/firebase.js
import { initializeApp } from 'firebase/app';
// On importe Auth et la persistance React Native
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAZ5m-bS-mJ4dSRkyKvBwARuddsXpuCeb0",
  authDomain: "khedmama-f7d19.firebaseapp.com",
  projectId: "khedmama-f7d19",
  storageBucket: "khedmama-f7d19.firebasestorage.app",
  messagingSenderId: "254137134406",
  appId: "1:254137134406:web:c5793080a58200a26d0947",
  measurementId: "G-JFGNS8QV7Z"
};

// Initialisation de l'app
const app = initializeApp(firebaseConfig);

// Initialisation de l'Auth AVEC persistance
// C'est ce bloc qui supprime l'avertissement jaune
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };