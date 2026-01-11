import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAZ5m-bS-mJ4dSRkyKvBwARuddsXpuCeb0",
  authDomain: "khedmama-f7d19.firebaseapp.com",
  projectId: "khedmama-f7d19",
  storageBucket: "khedmama-f7d19.firebasestorage.app",
  messagingSenderId: "254137134406",
  appId: "1:254137134406:web:c5793080a58200a26d0947",
  measurementId: "G-JFGNS8QV7Z"
};

// Initialisation simple pour le Web
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };