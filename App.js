// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // NOUVEAU
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Pour les icônes du bas

// Import des écrans
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import ProProfileScreen from './src/screens/ProProfileScreen';
import BookingScreen from './src/screens/bookingScreen';
import ActivityScreen from './src/screens/ActivityScreen'; 
import SettingsScreen from './src/screens/SettingsScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
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
          // Tu pourras ajouter 'Profil' ici plus tard
          
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Activité" component={ActivityScreen} />
      <Tab.Screen name="Profil" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="Login">
        
        
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

       
        <Stack.Screen 
          name="HomeApp" 
          component={HomeTabs} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Details" 
          component={DetailsScreen} 
          options={{ title: 'Recherche' }} 
        />
        <Stack.Screen 
            name="ProProfile" 
            component={ProProfileScreen} 
            options={({ route }) => ({ title: route.params.proData.name })} 
        />
        
        <Stack.Screen 
            name="Booking" 
            component={BookingScreen} 
            options={{ title: 'Demande' }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}