// src/screens/DetailsScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { runCypher } from '../services/neo4jService';

const DetailsScreen = ({ route, navigation }) => {
  // On récupère le métier choisi ET l'utilisateur connecté
  const { serviceName, currentUser } = route.params;
  
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RÉCUPÉRATION DES DONNÉES NEO4J ---
  useEffect(() => {
    const fetchPros = async () => {
      try {
        // On cherche les prestataires qui font ce métier
        const query = `
          MATCH (p:Prestataire)
          WHERE p.metier = $metier
          RETURN p
        `;
        const params = { metier: serviceName };
        const records = await runCypher(query, params);

        // On nettoie les données pour les rendre utilisables
        const pros = records.map(record => record.get('p').properties);
        setPrestataires(pros);
      } catch (error) {
        console.error("Erreur Neo4j:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPros();
  }, [serviceName]);

  const renderProCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ProProfile', { proData: item, currentUser: currentUser })}
    >
      {/* Avatar (Image par défaut si pas d'image) */}
      <View style={styles.avatarContainer}>
         <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.avatar} 
         />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.nom}</Text>
        <Text style={styles.job}>{item.metier}</Text>
        <Text style={styles.price}>{item.tarifHoraire ? `${item.tarifHoraire} DH/h` : 'Prix sur devis'}</Text>
        
        <View style={styles.ratingRow}>
           <Ionicons name="star" size={16} color="#FFD700" />
           <Text style={styles.rating}>{item.noteMoyenne || "Nouveau"}</Text>
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
          keyExtractor={(item) => item.id} // ID unique Firebase/Neo4j
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Aucun prestataire trouvé pour le moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, color: '#333' },
  listContent: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, borderRadius: 15, marginBottom: 12,
    // Ombre douce
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  avatarContainer: { marginRight: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
  infoContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  job: { fontSize: 14, color: 'gray', marginBottom: 2 },
  price: { fontSize: 14, color: '#2196f3', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 12, color: '#555', marginLeft: 4, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: 'gray', marginTop: 10, fontSize: 16 }
});

export default DetailsScreen;