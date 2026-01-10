// src/screens/ActivityScreen.js
import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { runCypher } from '../services/neo4jService';

const ActivityScreen = ({ route, navigation }) => {
  // On récupère l'utilisateur. S'il n'est pas là, on évite le crash.
  const user = route.params?.user; 

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. FONCTION DE RÉCUPÉRATION DES DONNÉES ---
  const fetchActivities = async () => {
    // 🛑 CORRECTION DU BUG INFINI :
    // Si pas de user, on arrête le chargement immédiatement.
    if (!user) {
        console.log("Erreur : Aucun utilisateur détecté dans ActivityScreen");
        setLoading(false);
        setRefreshing(false);
        return;
    }

    try {
      // Requete : On part du CLIENT -> vers le PRESTATAIRE
      const query = `
        MATCH (c:Client {id: $clientId})-[r:RESERVE]->(p:Prestataire)
        RETURN p, r
        ORDER BY r.dateCreation DESC
      `;

      const params = { clientId: user.id };
      const records = await runCypher(query, params);

      const parsedActivities = records.map(record => {
        const pro = record.get('p').properties;
        const resa = record.get('r').properties;
        
        return {
            id: record.get('r').identity.toString(), // ID unique de la réservation
            proName: pro.nom,
            proJob: pro.metier,
            datePrevue: resa.datePrevue,
            status: resa.status || 'EN_ATTENTE', // Valeur par défaut si null
            description: resa.description,
            price: pro.tarifHoraire ? pro.tarifHoraire + ' DH/h' : 'Sur devis'
        };
      });

      setActivities(parsedActivities);

    } catch (error) {
      console.error("Erreur ActivityScreen:", error);
      Alert.alert("Erreur", "Impossible de charger l'historique");
    } finally {
      // ✅ Ici on est sûr que ça s'exécute toujours
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  // --- 2. GESTION DES COULEURS DE STATUS ---
  const getStatusStyle = (status) => {
    switch (status) {
        case 'EN_ATTENTE':
            return { color: '#FF9800', label: 'En attente', icon: 'clock-outline', bg: '#FFF3E0' };
        case 'EN_COURS':
            return { color: '#2196F3', label: 'Accepté', icon: 'check-circle-outline', bg: '#E3F2FD' };
        case 'TERMINE':
            return { color: '#4CAF50', label: 'Terminé', icon: 'checkbox-marked-circle-outline', bg: '#E8F5E9' };
        case 'REFUSE':
            return { color: '#F44336', label: 'Refusé', icon: 'close-circle-outline', bg: '#FFEBEE' };
        default:
            return { color: '#9E9E9E', label: status, icon: 'help-circle-outline', bg: '#F5F5F5' };
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        {/* En-tête de la carte : Nom du pro et Statut */}
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.proName}>{item.proName}</Text>
                <Text style={styles.proJob}>{item.proJob}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                <MaterialCommunityIcons name={statusStyle.icon} size={14} color={statusStyle.color} />
                <Text style={[styles.badgeText, { color: statusStyle.color }]}> {statusStyle.label}</Text>
            </View>
        </View>

        <View style={styles.divider} />

        {/* Détails */}
        <View style={styles.row}>
            <MaterialCommunityIcons name="calendar" size={16} color="#757575" />
            <Text style={styles.detailText}> {item.datePrevue}</Text>
        </View>
        
        <View style={styles.row}>
            <MaterialCommunityIcons name="text-box-outline" size={16} color="#757575" />
            <Text style={styles.detailText} numberOfLines={2}> {item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    // J'ai remplacé SafeAreaView par View pour enlever le warning
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Activités</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196f3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#ddd" />
                <Text style={styles.emptyText}>Aucune activité récente</Text>
                {!user && <Text style={{color:'red', marginTop:10}}>Erreur: Utilisateur non connecté</Text>}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 30 }, // paddingTop remplace SafeAreaView
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  list: { padding: 15 },
  
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity:0.05 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  proName: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  proJob: { fontSize: 14, color: '#7f8c8d', marginTop: 2 },
  
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { color: '#555', fontSize: 14, marginLeft: 5, flex: 1 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 10 }
});

export default ActivityScreen;