// src/screens/DetailsScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { runCypher } from '../services/neo4jService';

const DetailsScreen = ({ route, navigation }) => {
  // On récupère le métier choisi (ex: "Plombier") ET l'utilisateur connecté (Client)
  const { serviceName, currentUser } = route.params;
  
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RÉCUPÉRATION DES DONNÉES NEO4J ---
  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        // ✅ REQUÊTE OPTIMISÉE :
        // 1. On cherche les noeuds qui sont À LA FOIS 'Utilisateur' et 'Prestataire'
        // 2. On filtre par métier exact
        // 3. On ne prend que ceux qui sont disponibles
        const query = `
          MATCH (p:Utilisateur:Prestataire)
          WHERE p.metier = $metier AND p.estDisponible = true
          RETURN p
        `;
        
        const params = { metier: serviceName };
        const records = await runCypher(query, params);

        // On extrait les propriétés de chaque noeud trouvé
        const pros = records.map(record => record.get('p').properties);
        setPrestataires(pros);

      } catch (error) {
        console.error("Erreur Neo4j:", error);
        Alert.alert("Erreur", "Impossible de charger les prestataires. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    };

    fetchPros();
  }, [serviceName]);

  const renderProCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      // On envoie les infos du pro ET du client vers le profil du pro pour réserver
      onPress={() => navigation.navigate('ProProfile', { proData: item, currentUser: currentUser })}
    >
      {/* Avatar (Image par défaut si pas d'image) */}
      <View style={styles.avatarContainer}>
         <Image 
            // Si le pro a une photo, on l'affiche, sinon image générique
            source={item.photo ? { uri: item.photo } : { uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.avatar} 
         />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.nom}</Text>
        <Text style={styles.job}>{item.metier}</Text>
        <Text style={styles.price}>{item.tarifHoraire ? `${item.tarifHoraire} DH/h` : 'Prix sur devis'}</Text>
        
        <View style={styles.ratingRow}>
           <Ionicons name="star" size={16} color="#FFD700" />
           {/* On gère le cas où la note est null ou 0 */}
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
          keyExtractor={(item) => item.id} // ID unique venant de Firebase/Neo4j
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search" size={60} color="#e0e0e0" />
                <Text style={styles.emptyTitle}>Oups !</Text>
                <Text style={styles.emptyText}>Aucun {serviceName} disponible pour le moment.</Text>
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
    // Ombre plus esthétique
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  avatarContainer: { marginRight: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f2f5' },
  infoContainer: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#2c3e50', marginBottom: 2 },
  job: { fontSize: 13, color: '#7f8c8d', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontSize: 15, color: '#2196f3', fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: '#fff9c4', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  rating: { fontSize: 12, color: '#fbc02d', marginLeft: 4, fontWeight: 'bold' },
  
  // Styles pour l'état vide
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#95a5a6', marginTop: 10 },
  emptyText: { color: '#95a5a6', marginTop: 5, fontSize: 14 }
});

export default DetailsScreen;