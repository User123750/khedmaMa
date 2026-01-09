// src/features/user-auth/auth-screens/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../auth/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { signOut, user, resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui, déconnexion", 
          style: "destructive",
          onPress: () => signOut() 
        }
      ]
    );
  };

  const handleResetPassword = () => {
    setError('');
    setSuccess('');
    const email = user?.email || '';
    if (!email) {
      setError('Email introuvable sur le profil');
      return;
    }
    resetPassword(email)
      .then(() => setSuccess('Email de réinitialisation envoyé'))
      .catch(() => setError('Échec de l’envoi, réessayez'));
  };

  return (
    <View style={styles.container}>
      {/* En-tête Profil */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/85.jpg' }} 
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.displayName || 'Client'}</Text>
        <Text style={styles.email}>{user?.email || 'client@khedma.ma'}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="account-edit-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Modifier mon profil</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Moyens de paiement</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Notifications</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Aide et Support</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleResetPassword}>
          <MaterialCommunityIcons name="key-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Réinitialiser le mot de passe</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#ff4444" />
          <Text style={[styles.menuText, styles.logoutText]}>Se déconnecter</Text>
        </TouchableOpacity>

      </View>
      {error ? <Text style={{ textAlign: 'center', color: '#ff4444', marginTop: 10 }}>{error}</Text> : null}
      {success ? <Text style={{ textAlign: 'center', color: '#2e7d32', marginTop: 10 }}>{success}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { color: 'gray', fontSize: 16 },
  menu: { backgroundColor: '#fff', paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333' },
  logoutButton: { borderBottomWidth: 0, marginTop: 20 },
  logoutText: { color: '#ff4444', fontWeight: 'bold' }
});

export default ProfileScreen;
