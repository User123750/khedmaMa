// src/screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui, déconnexion", 
          style: "destructive",
          // On renvoie vers l'écran de Login et on vide l'historique de navigation
          onPress: () => navigation.replace('Login') 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête Profil */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/85.jpg' }} 
          style={styles.avatar}
        />
        <Text style={styles.name}>Client Test</Text>
        <Text style={styles.email}>client@khedma.ma</Text>
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

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#ff4444" />
          <Text style={[styles.menuText, styles.logoutText]}>Se déconnecter</Text>
        </TouchableOpacity>

      </View>
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

export default SettingsScreen;