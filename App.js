// App.js
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import des écrans
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import ProProfileScreen from './src/screens/ProProfileScreen';
import BookingScreen from './src/screens/bookingScreen';
import ActivityScreen from './src/screens/ActivityScreen'; 
import SettingsScreen from './src/screens/SettingsScreen';

// --- Imports des écrans manquants pour les boutons des paramètres ---
// (Si tu n'as pas encore créé ces fichiers, l'appli affichera une erreur.
// Assure-toi qu'ils existent ou commente les imports/écrans temporairement)
import PaymentScreen from './src/screens/PaymentScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SupportScreen from './src/screens/SupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configuration du thème
const MyTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#f8f9fa' },
};

// 2. CONFIGURATION DES ONGLETS AVEC TRANSMISSION DE DONNÉES
// On accepte 'route' ici pour récupérer les paramètres envoyés par LoginScreen
function HomeTabs({ route }) {
  // On récupère l'objet user envoyé depuis le Login
  const user = route.params?.user; 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarActiveTintColor: '#2196f3', 
        tabBarInactiveTintColor: 'gray', 
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Accueil') iconName = 'home';
          else if (route.name === 'Activité') iconName = 'file-document-outline';
          else if (route.name === 'Profil') iconName = 'account';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* ✅ IMPORTANT : On utilise initialParams pour passer 'user' aux écrans */}
      <Tab.Screen name="Accueil" component={HomeScreen} initialParams={{ user: user }} />
      <Tab.Screen name="Activité" component={ActivityScreen} />
      <Tab.Screen name="Profil" component={SettingsScreen} initialParams={{ user: user }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="LoginScreen">  
        
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />

        {/* HomeApp contient les Tabs */}
        <Stack.Screen name="HomeApp" component={HomeTabs} options={{ headerShown: false }} />

        {/* Détails et Réservation */}
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Recherche' }} />
        <Stack.Screen name="ProProfile" component={ProProfileScreen} options={({ route }) => ({ title: route.params?.proData?.nom || 'Profil Pro' })} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Demande' }} />

        {/* --- Ecrans des Paramètres (Pour que les boutons fonctionnent) --- */}
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier mon profil' }} />
        <Stack.Screen name="PaymentMethods" component={PaymentScreen} options={{ title: 'Moyens de paiement' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Aide & Support' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}