import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';

import UserStack from './UserStack';
import AdminLoginScreen from '../features/admin-auth/auth-screens/AdminLoginScreen';

import AdminDashboard from '../screens/AdminDashboard';
import HomeTabs from './HomeTabs';
import DetailsScreen from '../screens/DetailsScreen';
import ProProfileScreen from '../screens/ProProfileScreen';
import BookingScreen from '../screens/bookingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  console.log('CURRENT USER ===>', user?.email);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* ❌ */}
      {!user && (
        <>
          <Stack.Screen name="Auth" component={UserStack} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        </>
      )}

      {/* ✅ ADMIN  */}
      {user && user.email === 'admin@khedma.ma' && (
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ headerShown: true, title: 'Dashboard Admin' }}
        />
      )}

      {/* ✅ USER NORMAL */}
      {user && user.email !== 'admin@khedma.ma' && (
        <>
          <Stack.Screen name="HomeApp" component={HomeTabs} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="ProProfile" component={ProProfileScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
        </>
      )}

    </Stack.Navigator>
  );
}