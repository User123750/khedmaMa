// src/screens/DetailsScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { runCypher } from '../services/neo4jService';

const DetailsScreen = ({ route, navigation }) => {
  const { serviceName, currentUser } = route.params;
  
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour nettoyer les données Neo4j (comme vu précédemment)
  const serializeNeo4jData = (properties) => {
    const cleaned = {};
    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      if (value && typeof value === 'object') {
        if (value.toNumber) cleaned[key] = value.toNumber();
        else if (value.toString) cleaned[key] = value.toString();
        else cleaned[key] = value;
      } else {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const query = `
          MATCH (p:Utilisateur:Prestataire)
          WHERE p.metier = $metier AND p.estDisponible = true
          RETURN p
        `;
        const params = { metier: serviceName };
        const records = await runCypher(query, params);
        const pros = records.map(record => {
            const node = record.get('p');
            const cleanProps = serializeNeo4jData(node.properties);
            return { ...cleanProps, id: cleanProps.id || Math.random().toString() }; 
        });
        setPrestataires(pros);
      } catch (error) {
        console.error("Erreur Neo4j:", error);
        Alert.alert("Erreur", "Impossible de charger les prestataires.");
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, [serviceName]);

  const renderProCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Booking', { proData: item, currentUser: currentUser })}
    >
      <View style={styles.avatarContainer}>
         {/* ✅ CORRECTION ICI POUR L'IMAGE */}
         <Image 
            source={
              item.photo 
                ? { uri: item.photo } // Si une photo existe, on l'utilise
                : { uri: `https://ui-avatars.com/api/?name=${item.nom}&background=E3F2FD&color=2196f3&bold=true` } // Sinon, on génère un avatar avec son nom
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
             {item.noteMoyenne && item.noteMoyenne > 0 ? item.noteMoyenne : "Nouveau"}
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
  // J'ai enlevé le backgroundColor ici car il est géré par l'API ui-avatars
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