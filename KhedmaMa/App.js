// App.js
import React from 'react';
import { View, Platform } from 'react-native'; // Ajouté pour le style
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PaymentScreen from './src/screens/PaymentScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import ProProfileScreen from './src/screens/ProProfileScreen';
import BookingScreen from './src/screens/bookingScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SupportScreen from './src/screens/SupportScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. COULEURS & THEME : On définit une palette pour la cohérence
const COLORS = {
  primary: '#2196f3',
  secondary: '#FF6584', // Exemple pour les actions
  background: '#f8f9fa',
  text: '#333333',
  white: '#ffffff',
  tabBar: '#ffffff',
};

// Thème de navigation global (enlève le fond gris par défaut)
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
  },
};

// 2. CONFIGURATION DES ONGLETS (Tabs)
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false, // Plus moderne sans texte, ou remets à true si tu préfères
        
        // Style de la barre "Flottante" (Modern look)
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 5, // Ombre sur Android
          backgroundColor: COLORS.tabBar,
          borderRadius: 15,
          height: 70,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 10 }, // Ombre iOS
          }),
        },

        // Logique des icônes optimisée
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          
          // On change l'icône si l'onglet est actif (version "outline" vs "filled")
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Activité') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'account-cog' : 'account-cog-outline';
          }

          // Centrer l'icône car on a enlevé le texte
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 0 }}>
              <MaterialCommunityIcons name={iconName} size={30} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Activité" component={ActivityScreen} />
      <Tab.Screen name="Profil" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// 3. NAVIGATION PRINCIPALE
export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar style="auto" /> 
      
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          // Options par défaut pour tous les écrans du Stack
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitleVisible: false, // Cache le texte "Retour" sur iOS
          animation: 'slide_from_right', // Animation fluide
        }}
      >
        
        {/* Login sans header */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

        {/* HomeApp contient les Tabs, on cache le header du Stack pour laisser celui des Tabs (ou aucun) */}
        <Stack.Screen 
          name="HomeApp" 
          component={HomeTabs} 
          options={{ headerShown: false }} 
        />

        {/* Ecrans de détails */}
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen} 
          options={{ title: 'Recherche détaillée' }} 
        />
        
        <Stack.Screen 
          name="ProProfile" 
          component={ProProfileScreen} 
          options={({ route }) => ({ 
            title: route.params?.proData?.name || 'Profil Pro', // Protection contre les crashs si pas de data
          })} 
        />
        
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen} 
          options={{ title: 'Réservation' }} 
        />
<Stack.Screen 
  name="EditProfile" 
  component={EditProfileScreen} 
  options={{ title: 'Modifier mon profil' }} 
/>
<Stack.Screen 
  name="PaymentMethods" 
  component={PaymentScreen} 
  options={{ title: 'Moyens de paiement' }} 
/>
{/* ... après PaymentMethods ... */}
<Stack.Screen 
  name="Notifications" 
  component={NotificationsScreen} 
  options={{ title: 'Notifications' }} 
/>
<Stack.Screen 
  name="Support" 
  component={SupportScreen} 
  options={{ title: 'Aide & Support' }} 
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}