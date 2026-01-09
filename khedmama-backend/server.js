// src/screens/HomeScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';

// Importation des icônes
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Nos données (Catégories statiques)
const SERVICES = [
  { id: '1', title: 'Plombier', icon: 'pipe-wrench', color: '#e3f2fd', iconColor: '#2196f3' },
  { id: '2', title: 'Électricien', icon: 'lightning-bolt', color: '#fff3e0', iconColor: '#ff9800' },
  { id: '3', title: 'Ménage', icon: 'broom', color: '#e8f5e9', iconColor: '#4caf50' },
  { id: '4', title: 'Peinture', icon: 'format-paint', color: '#f3e5f5', iconColor: '#9c27b0' },
  { id: '5', title: 'Jardinage', icon: 'flower', color: '#fbe9e7', iconColor: '#ff5722' },
  { id: '6', title: 'Mécanicien', icon: 'car-wrench', color: '#eceff1', iconColor: '#607d8b' },
];

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25; 

// ✅ Ajout de 'route' dans les arguments pour récupérer les données
const HomeScreen = ({ route, navigation }) => {

  // ✅ 2. On récupère l'utilisateur connecté depuis les paramètres de navigation
  // Si pour une raison ou une autre ça arrive vide, on met "Invité" par sécurité
  const user = route.params?.user || { nom: 'Invité' };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: item.color }]}
      // ✅ 3. IMPORTANT : On passe l'utilisateur (currentUser) à l'écran suivant
      onPress={() => navigation.navigate('Details', { 
        serviceName: item.title, 
        currentUser: user 
      })}
    >
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.iconColor} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* ✅ 4. Affichage dynamique du nom */}
        <Text style={styles.greeting}>Bonjour, {user.nom} 👋</Text>
        <Text style={styles.subtitle}>De quel service avez-vous besoin ?</Text>
      </View>

      <FlatList
        data={SERVICES}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id}
        numColumns={2} 
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
    paddingTop: 50, // Un peu plus d'espace pour la barre d'état
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
    justifyContent: 'space-between',
  },
  card: {
    width: COLUMN_WIDTH,
    height: 140,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
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