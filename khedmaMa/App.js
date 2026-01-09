import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- IMPORTS CLIENT ---
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import BookingScreen from './src/screens/bookingScreen';
import ActivityScreen from './src/screens/ActivityScreen'; 
import SettingsScreen from './src/screens/SettingsScreen';

// --- IMPORTS PRESTATAIRE (AJOUTÉS) ---
import ProHomeScreen from './src/screens/ProHomeScreen';
import ProProfileScreen from './src/screens/ProProfileScreen'; // Vérifie le nom du fichier (1 n ou 2 n)
import WalletScreen from './src/screens/WalletScreen';

// --- IMPORTS PARAMÈTRES ---
import PaymentScreen from './src/screens/PaymentScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SupportScreen from './src/screens/SupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#f8f9fa' },
};

// --- MENU CLIENT ---
function HomeTabs({ route }) {
  const user = route.params?.user; 
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarActiveTintColor: '#2196f3', 
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
      <Tab.Screen name="Accueil" component={HomeScreen} initialParams={{ user: user }} />
      <Tab.Screen name="Activité" component={ActivityScreen} />
      <Tab.Screen name="Profil" component={SettingsScreen} initialParams={{ user: user }} />
    </Tab.Navigator>
  );
}

// --- MENU PRESTATAIRE (NOUVEAU) ---
function ProTabs({ route }) {
  const user = route.params?.user; 
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarActiveTintColor: '#2196f3', 
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Missions') iconName = 'briefcase-check';
          else if (route.name === 'Revenus') iconName = 'wallet';
          else if (route.name === 'Profil Pro') iconName = 'account-tie';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Missions" component={ProHomeScreen} initialParams={{ user: user }} />
      <Tab.Screen name="Revenus" component={WalletScreen} initialParams={{ currentUser: user }} />
      <Tab.Screen name="Profil Pro" component={ProProfileScreen} initialParams={{ currentUser: user }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="LoginScreen">  
        
        {/* Auth */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />

        {/* Espace CLIENT */}
        <Stack.Screen name="HomeApp" component={HomeTabs} options={{ headerShown: false }} />

        {/* Espace PRESTATAIRE (AJOUTÉ) */}
        <Stack.Screen name="ProApp" component={ProTabs} options={{ headerShown: false }} />

        {/* Autres pages */}
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Recherche' }} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Demande' }} />
        <Stack.Screen name="ProProfile" component={ProProfileScreen} options={{ title: 'Profil Pro' }} />

        {/* Paramètres */}
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier profil' }} />
        <Stack.Screen name="PaymentMethods" component={PaymentScreen} options={{ title: 'Moyens de paiement' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Aide & Support' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}