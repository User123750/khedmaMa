// src/screens/ProProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const ProProfileScreen = ({ route, navigation }) => {
  // On récupère les données du pro ET de l'utilisateur connecté
  const { proData, currentUser } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.avatar}
          />
          <Text style={styles.name}>{proData.nom}</Text>
          <Text style={styles.job}>{proData.metier}</Text>
          
          <View style={styles.ratingContainer}>
             <Ionicons name="star" size={20} color="#FFD700" />
             <Text style={styles.ratingText}>{proData.noteMoyenne || "Nouveau"} (0 avis)</Text>
          </View>
        </View>

        {/* Statistiques Dynamiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
             <MaterialCommunityIcons name="timer-outline" size={24} color="#555" />
             <Text style={styles.statLabel}>Dispo</Text>
          </View>
          <View style={styles.statItemBorder}>
             <MaterialCommunityIcons name="cash-multiple" size={24} color="#555" />
             <Text style={styles.statLabel}>{proData.tarifHoraire} DH/h</Text>
          </View>
          <View style={styles.statItem}>
             <MaterialCommunityIcons name="shield-check-outline" size={24} color="green" />
             <Text style={styles.statLabel}>Vérifié</Text>
          </View>
        </View>
        
        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bioText}>
            Bonjour, je suis {proData.nom}, expert en {proData.metier}. 
            Je suis disponible pour intervenir à votre domicile.
          </Text>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Bouton de Réservation */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => navigation.navigate('Booking', { proData: proData, currentUser: currentUser })}
        >
          <Text style={styles.mainButtonText}>Demander une intervention</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 20 },
  header: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  job: { fontSize: 18, color: 'gray', marginBottom: 10 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffcf0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  ratingText: { marginLeft: 5, fontWeight: 'bold', color: '#333' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: '#f9f9f9', marginBottom: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statItemBorder: { alignItems: 'center', flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e0e0e0' },
  statLabel: { marginTop: 5, color: '#555', fontSize: 14 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  bioText: { fontSize: 16, color: '#666', lineHeight: 24 },
  bottomButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  mainButton: { backgroundColor: '#2196f3', paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  mainButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default ProProfileScreen;