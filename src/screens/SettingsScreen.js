// src/screens/SettingsScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Pour détecter quand on revient sur l'écran

// Imports pour recharger les données
import { auth } from '../config/firebase';
import { runCypher } from '../services/neo4jService';

const SettingsScreen = ({ route, navigation }) => {
  // Données initiales (au cas où)
  const initialUser = route.params?.user || { nom: 'Invité', email: 'Non connecté', role: 'CLIENT' };
  
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  // --- RECHARGEMENT DES DONNÉES À CHAQUE RETOUR SUR L'ÉCRAN ---
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
          const query = `MATCH (u:Utilisateur {id: $uid}) RETURN u`;
          const records = await runCypher(query, { uid });

          if (records.length > 0) {
            const data = records[0].get('u').properties;
            // Mise à jour de l'affichage avec les nouvelles données (photo, nom...)
            setUser({
                id: data.id,
                nom: data.nom,
                email: data.email,
                role: data.role || 'CLIENT',
                photo: data.photo || null 
            });
          }
        } catch (error) {
          console.error("Erreur refresh profil:", error);
        }
      };

      fetchUserData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui, déconnexion", 
          style: "destructive",
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          })
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête Profil */}
      <View style={styles.header}>
        
        {/* --- LOGIQUE D'AFFICHAGE PHOTO --- */}
        {user.photo ? (
            <Image 
                source={{ uri: user.photo }} 
                style={styles.avatarImage} 
            />
        ) : (
            <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={50} color="#fff" />
            </View>
        )}

        <Text style={styles.name}>{user.nom}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.roleBadge}>{user.role}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
          <MaterialCommunityIcons name="account-edit-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Modifier mon profil</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* ✅ CORRECTION ICI : On passe l'utilisateur à l'écran de paiement */}
        <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('PaymentMethods', { user: user })}
        >
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Moyens de paiement</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications', { user: user })}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Notifications</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Support')}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#555" />
          <Text style={styles.menuText}>Aide et Support</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

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
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#eee'
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { color: 'gray', fontSize: 16 },
  roleBadge: { marginTop: 5, fontSize: 12, color: '#2196f3', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
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