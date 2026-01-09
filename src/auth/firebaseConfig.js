import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
/*
const firebaseConfig = {
  apiKey: 'AIzaSyAto1rBtMzC3CfsNuN4oTpssr6_rCGc2cg',
  authDomain: 'khedmama.firebaseapp.com',
  projectId: 'khedmama',
  storageBucket: 'khedmama.firebasestorage.app',
  messagingSenderId: 'YOUR_S99420604702',
  appId: 'YOUR_APP_ID1:99420604702:web:3c08e330d0ca28e3f8e10f'
};
*/
const firebaseConfig = {
  apiKey: "AIzaSyBLmcgNf57kwY5s8jgsKC0Av5dHrv34xFE",
  authDomain: "khedma-61e2c.firebaseapp.com",
  projectId: "khedma-61e2c",
  storageBucket: "khedma-61e2c.firebasestorage.app",
  messagingSenderId: "932147183544",
  appId: "1:932147183544:web:a8df5b899f630ab47a194d",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
