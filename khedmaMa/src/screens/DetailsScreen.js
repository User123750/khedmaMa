import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Ton IP locale (celle qui fonctionne chez toi)
const API_URL_BASE = 'http://10.181.182.244:3000/api/providers';

const DetailsScreen = ({ route, navigation }) => {
  const { serviceName, currentUser } = route.params;
  
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchPros = async () => {
        // On affiche le chargement seulement si la liste est vide (pour éviter que ça clignote trop)
        if(prestataires.length === 0) setLoading(true);
        
        try {
          // On ajoute un timestamp (?t=...) pour empêcher le téléphone de garder l'ancienne réponse en cache
          const response = await fetch(`${API_URL_BASE}/${serviceName}?t=${new Date().getTime()}`);
          const data = await response.json();
          
          if (isActive) {
            setPrestataires(data);
          }
        } catch (error) {
          console.error("Erreur Fetch:", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchPros();

      return () => {
        isActive = false;
      };
    }, [serviceName]) 
  );

  const renderProCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Booking', { proData: item, currentUser: currentUser })}
    >
      <View style={styles.avatarContainer}>
         <Image 
            source={
              item.photo 
                ? { uri: item.photo } 
                : { uri: `https://ui-avatars.com/api/?name=${item.nom}&background=E3F2FD&color=2196f3&bold=true` }
            }
            style={styles.avatar} 
         />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.nom}</Text>
        <Text style={styles.job}>{item.metier}</Text>
        <Text style={styles.price}>{item.tarifHoraire ? `${item.tarifHoraire} DH/h` : 'Prix sur devis'}</Text>
        
        <View style={styles.ratingRow}>
           <Ionicons name="star" size={16} color="#FFD700" />
           <Text style={styles.rating}>
             {/* Affiche le nombre de réservations en direct */}
             {item.popularity > 0 ? `${item.popularity} réservations` : "Nouveau"}
           </Text>
        </View>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Nos {serviceName}s disponibles</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2196f3" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={prestataires}
          renderItem={renderProCard}
          keyExtractor={(item) => item.id.toString()} 
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => { /* Le useFocusEffect gère déjà, mais ceci active l'animation */ }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search" size={60} color="#e0e0e0" />
                <Text style={styles.emptyTitle}>Oups !</Text>
                <Text style={styles.emptyText}>Aucun {serviceName} disponible.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginBottom: 20, color: '#2c3e50' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, borderRadius: 16, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  avatarContainer: { marginRight: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30 }, 
  infoContainer: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#2c3e50', marginBottom: 2 },
  job: { fontSize: 13, color: '#7f8c8d', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontSize: 15, color: '#2196f3', fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: '#fff9c4', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  rating: { fontSize: 12, color: '#fbc02d', marginLeft: 4, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#95a5a6', marginTop: 10 },
  emptyText: { color: '#95a5a6', marginTop: 5, fontSize: 14 }
});

export default DetailsScreen;