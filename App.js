// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/auth/AuthContext';


// Import de la stack d'authentification utilisateur
import UserStack from './src/navigation/UserStack';
import FreelancerStack from './src/navigation/FreelancerStack';

import AdminStack from './src/navigation/AdminStack';
import AdminLoginScreen from './src/features/admin-auth/auth-screens/AdminLoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';




// Import des écrans principaux
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import ProProfileScreen from './src/screens/ProProfileScreen';
import BookingScreen from './src/screens/bookingScreen';
import ActivityScreen from './src/screens/ActivityScreen'; 
import ProfileScreen from './src/features/user-auth/auth-screens/ProfileScreen';
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
          
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Activité" component={ActivityScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


function RootNavigator() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Auth"
          component={UserStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FreelancerAuth"
          component={FreelancerStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

if (user.role === 'admin') {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminDashboard"
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Page Dashboard Admin (test)</Text>
          </View>
        )}
      />
    </Stack.Navigator>
  );
}

  if (user.role === 'freelancer') {
    return (
      <Stack.Navigator>
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
    );
  }
  // Par défaut, user simple
  return (
    <Stack.Navigator>
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}