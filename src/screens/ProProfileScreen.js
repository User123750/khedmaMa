// src/screens/ProProfileScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProProfileScreen = ({ route, navigation }) => {
  // On récupère les infos du pro sur lequel on a cliqué
  const { proData } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header avec Photo et Nom */}
        <View style={styles.header}>
           {/* Image de placeholder (à remplacer par la vraie photo plus tard) */}
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.avatar}
          />
          <Text style={styles.name}>{proData.name}</Text>
          <Text style={styles.job}>{proData.job}</Text>
          
          <View style={styles.ratingContainer}>
             <Ionicons name="star" size={20} color="#FFD700" />
             <Text style={styles.ratingText}>{proData.rating} (124 avis)</Text>
          </View>
        </View>

        {/* Barre de statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
             <MaterialCommunityIcons name="timer-outline" size={24} color="#555" />
             <Text style={styles.statLabel}>Rapide</Text>
          </View>
          <View style={styles.statItemBorder}>
             <MaterialCommunityIcons name="cash-multiple" size={24} color="#555" />
             <Text style={styles.statLabel}>~150 DH/h</Text>
          </View>
          <View style={styles.statItem}>
             <MaterialCommunityIcons name="shield-check-outline" size={24} color="green" />
             <Text style={styles.statLabel}>Vérifié</Text>
          </View>
        </View>
        
        {/* Section Biographie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bioText}>
            Bonjour, je suis {proData.name}, artisan {proData.job.toLowerCase()} professionnel avec 5 ans d'expérience à Casablanca. Spécialisé dans les dépannages d'urgence et les installations. Travail soigné et garanti.
          </Text>
        </View>

      {/* Espace vide pour que le bouton ne cache pas le texte à la fin */}
      <View style={{height: 100}} />
      </ScrollView>

      {/* Le gros bouton d'action en bas (Fixe) */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
            style={styles.mainButton}
            // C'est ICI qu'on lancera la commande plus tard
            onPress={() => alert('Demande envoyée au prestataire !')}
        >
          <Text style={styles.mainButtonText}>Demander une intervention</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  job: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffcf0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemBorder: {
    alignItems: 'center',
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  statLabel: {
    marginTop: 5,
    color: '#555',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  mainButton: {
    backgroundColor: '#2196f3', // Bleu Khedma
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default ProProfileScreen;