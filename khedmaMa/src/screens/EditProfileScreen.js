// src/screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { runCypher } from '../services/neo4jService';
import { auth } from '../config/firebase'; 

// 1. Import du sélecteur d'image
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  primary: '#2196f3',
  background: '#f8f9fa',
  text: '#333',
  gray: '#666',
  border: '#ddd',
  white: '#fff'
};

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    metier: '',
    photo: null
  });

  // Charger les données
  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const query = `MATCH (u:Utilisateur {id: $uid}) RETURN u`;
        const records = await runCypher(query, { uid });
        
        if (records.length > 0) {
          const data = records[0].get('u').properties;
          setUserInfo({
            name: data.nom || '',
            email: data.email || '',
            phone: data.telephone || '',
            address: data.adresse || '',
            metier: data.metier || '',
            photo: data.photo || null
          });
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 2. Fonction pour choisir une image
  const pickImage = async () => {
    // Demander la permission (automatique sur les versions récentes, mais bonne pratique)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      // On met à jour l'état avec la nouvelle image
      setUserInfo({ ...userInfo, photo: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setSaving(true);
    try {
      const query = `
        MATCH (u:Utilisateur {id: $uid})
        SET u.nom = $nom,
            u.telephone = $telephone,
            u.adresse = $adresse,
            u.metier = $metier,
            u.photo = $photo 
        RETURN u
      `;
      
      const params = {
        uid: uid,
        nom: userInfo.name,
        telephone: userInfo.phone,
        adresse: userInfo.address,
        metier: userInfo.metier,
        photo: userInfo.photo 
      };

      await runCypher(query, params);
      
      Alert.alert("Succès", "Profil mis à jour !", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      Alert.alert("Erreur", "Problème lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {/* 3. Affichage conditionnel de l'image */}
            <Image 
              source={
                userInfo.photo 
                  ? { uri: userInfo.photo } 
                  : { uri: 'https://i.pravatar.cc/150?img=12' } // Avatar par défaut si vide
              } 
              style={styles.avatar} 
            />
            {/* Bouton Caméra cliquable */}
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickImage}>
             <Text style={styles.avatarText}>Changer ma photo</Text>
          </TouchableOpacity>
        </View>

        {/* Formulaire */}
        <View style={styles.formSection}>
          
          <Text style={styles.label}>Nom complet</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userInfo.name}
              onChangeText={(text) => setUserInfo({...userInfo, name: text})}
            />
          </View>

          <Text style={styles.label}>Email (Non modifiable)</Text>
          <View style={[styles.inputContainer, {backgroundColor: '#e0e0e0'}]}>
            <MaterialCommunityIcons name="email" size={20} color={COLORS.gray} style={styles.icon} />
            <TextInput
              style={[styles.input, {color: COLORS.gray}]}
              value={userInfo.email}
              editable={false}
            />
          </View>

          <Text style={styles.label}>Téléphone</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="phone" size={20} color={COLORS.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userInfo.phone}
              keyboardType="phone-pad"
              onChangeText={(text) => setUserInfo({...userInfo, phone: text})}
            />
          </View>

          <Text style={styles.label}>Adresse</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userInfo.address}
              placeholder="Votre adresse"
              onChangeText={(text) => setUserInfo({...userInfo, address: text})}
            />
          </View>
          
        </View>

        <TouchableOpacity 
            style={[styles.saveButton, saving && {opacity: 0.7}]} 
            onPress={handleSave}
            disabled={saving}
        >
          {saving ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.saveButtonText}>Sauvegarder les modifications</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.white },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: COLORS.white },
  avatarText: { color: COLORS.primary, marginTop: 10, fontWeight: '600' },
  formSection: { backgroundColor: COLORS.white, borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  label: { color: COLORS.gray, marginBottom: 5, fontSize: 14, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', borderRadius: 10, paddingHorizontal: 15, height: 50, marginBottom: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.text, fontSize: 16 },
  saveButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  saveButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});