// src/screens/HomeScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions,
  Image 
} from 'react-native';

// Importation des icônes (inclus dans Expo)
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Nos données (Simulées pour l'instant)
const SERVICES = [
  { id: '1', title: 'Plombier', icon: 'pipe-wrench', color: '#e3f2fd', iconColor: '#2196f3' },
  { id: '2', title: 'Électricien', icon: 'lightning-bolt', color: '#fff3e0', iconColor: '#ff9800' },
  { id: '3', title: 'Ménage', icon: 'broom', color: '#e8f5e9', iconColor: '#4caf50' },
  { id: '4', title: 'Peinture', icon: 'format-paint', color: '#f3e5f5', iconColor: '#9c27b0' },
  { id: '5', title: 'Jardinage', icon: 'flower', color: '#fbe9e7', iconColor: '#ff5722' },
  { id: '6', title: 'Déménagement', icon: 'truck-delivery', color: '#eceff1', iconColor: '#607d8b' },
];

// On récupère la largeur de l'écran pour calculer la taille des cases
const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25; // 2 colonnes avec un peu de marge

const HomeScreen = ({ navigation }) => {

  // 2. Fonction pour dessiner CHAQUE carte de service
  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate('Details', { serviceName: item.title })}
    >
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.iconColor} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* En-tête simple */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, Rehab 👋</Text>
        <Text style={styles.subtitle}>De quel service avez-vous besoin ?</Text>
      </View>

      {/* 3. La Grille */}
      <FlatList
        data={SERVICES}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id}
        numColumns={2} // Affiche en 2 colonnes
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Espace égal entre les colonnes
  },
  card: {
    width: COLUMN_WIDTH,
    height: 140,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // Ombres douces (Shadows)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeScreen;