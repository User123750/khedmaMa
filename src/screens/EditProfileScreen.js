// src/screens/EditProfileScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Couleurs (Idéalement importées depuis ton fichier de constantes si tu en as fait un)
const COLORS = {
  primary: '#2196f3',
  background: '#f8f9fa',
  text: '#333',
  gray: '#666',
  border: '#ddd',
  white: '#fff'
};

export default function EditProfileScreen({ navigation }) {
  // Simulation des données actuelles de l'utilisateur
  const [userInfo, setUserInfo] = useState({
    name: 'Client Test',
    email: 'client@khedma.ma',
    phone: '06 00 00 00 00',
    address: 'Casablanca, Maroc',
    bio: ''
  });

  const handleSave = () => {
    // Ici, tu connecteras plus tard l'API Backend pour sauvegarder
    console.log('Données sauvegardées :', userInfo);
    navigation.goBack(); // Retourne au profil après la sauvegarde
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {/* Image factice ou avatar par défaut */}
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.cameraButton}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarText}>Changer ma photo</Text>
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

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email" size={20} color={COLORS.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userInfo.email}
              keyboardType="email-address"
              onChangeText={(text) => setUserInfo({...userInfo, email: text})}
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
              onChangeText={(text) => setUserInfo({...userInfo, address: text})}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder les modifications</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarText: {
    color: COLORS.primary,
    marginTop: 10,
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    color: COLORS.gray,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});