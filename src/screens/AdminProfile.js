import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export default function AdminProfile() {
  const { signOut } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profil Admin</Text>
      <Button title="Se déconnecter" onPress={() => signOut()} />
    </View>
  );
}