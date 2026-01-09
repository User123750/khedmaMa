import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FreelancerLoginScreen from '../features/freelancer-auth/auth-screens/FreelancerLoginScreen';
import FreelancerRegisterScreen from '../features/freelancer-auth/auth-screens/FreelancerRegisterScreen';

const Stack = createNativeStackNavigator();

export default function FreelancerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FreelancerLogin" component={FreelancerLoginScreen} />
      <Stack.Screen name="FreelancerSignup" component={FreelancerRegisterScreen} />
    </Stack.Navigator>
  );
}
