import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, 
  ActivityIndicator, RefreshControl, SafeAreaView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { runCypher } from '../services/neo4jService';

const ProHomeScreen = ({ route, navigation }) => {
  // On s'assure d'avoir un user, sinon valeur par défaut pour éviter le crash
  const user = route.params?.user || { nom: 'Pro', id: '' };
  
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // ID de la mission en cours de traitement

  // 🔄 1. Récupérer les missions EN_ATTENTE
  const fetchMissions = async () => {
    try {
      // On cherche les missions liées au prestataire (relation REALISE)
      // Et on récupère le client lié à la mission (relation DEMANDE)
      const query = `
        MATCH (p:Utilisateur:Prestataire {id: $id})<-[:REALISE]-(m:Mission)<-[:DEMANDE]-(c:Utilisateur:Client)
        WHERE m.statut = 'EN_ATTENTE'
        RETURN m, c
        ORDER BY m.dateHeure DESC
      `;

      const records = await runCypher(query, { id: user.id });

      const parsedMissions = records.map(record => {
        const mission = record.get('m').properties;
        const client = record.get('c').properties;

        return {
          id: mission.id, // ID Neo4j ou ID généré
          clientName: client.nom,
          clientTel: client.telephone,
          adresse: client.adresse || 'Adresse non spécifiée',
          date: mission.dateHeure ? new Date(mission.dateHeure).toLocaleString('fr-FR') : 'Date inconnue',
          prix: mission.prixTotal,
          description: mission.description || 'Aucune description',
          // On garde l'objet complet au cas où
          rawClient: client
        };
      });

      setMissions(parsedMissions);
    } catch (error) {
      console.error("Erreur fetch missions:", error);
      Alert.alert("Erreur", "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charge les données quand l'écran s'affiche
  useFocusEffect(
    useCallback(() => {
      fetchMissions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMissions();
  };

  // 🟢 2. Accepter une mission
  const handleAccept = async (missionId) => {
    setActionLoading(missionId);
    try {
      const query = `
        MATCH (m:Mission {id: $missionId})
        SET m.statut = 'EN_COURS'
        RETURN m
      `;
      await runCypher(query, { missionId });
      
      Alert.alert("Bravo 🚀", "Mission acceptée ! Vous pouvez la retrouver dans l'onglet Missions.");
      
      // On retire la mission de la liste locale
      setMissions(prev => prev.filter(m => m.id !== missionId));
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d'accepter la mission.");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔴 3. Refuser une mission
  const handleRefuse = async (missionId) => {
    Alert.alert(
      "Refuser la mission",
      "Êtes-vous sûr ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser",
          style: "destructive",
          onPress: async () => {
            setActionLoading(missionId);
            try {
              // On passe le statut à REFUSE ou ANNULE
              const query = `
                MATCH (m:Mission {id: $missionId})
                SET m.statut = 'REFUSE'
                RETURN m
              `;
              await runCypher(query, { missionId });
              setMissions(prev => prev.filter(m => m.id !== missionId));
            } catch (error) {
              console.error(error);
              Alert.alert("Erreur", "Impossible de refuser la mission.");
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const renderMission = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.clientInfo}>
             <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.clientName ? item.clientName.charAt(0).toUpperCase() : '?'}
                </Text>
             </View>
             <View>
                <Text style={styles.clientName}>{item.clientName}</Text>
                <Text style={styles.address}>{item.adresse}</Text>
             </View>
        </View>
        <Text style={styles.price}>{item.prix} DH</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
            <MaterialCommunityIcons name="calendar-clock" size={18} color="#666" />
            <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      <View style={styles.actions}>
        {/* Bouton Refuser */}
        <TouchableOpacity 
            style={[styles.btn, styles.btnRefuse]} 
            onPress={() => handleRefuse(item.id)}
            disabled={actionLoading === item.id}
        >
            <Text style={styles.btnTextRefuse}>Refuser</Text>
        </TouchableOpacity>
        
        {/* Bouton Accepter */}
        <TouchableOpacity 
            style={[styles.btn, styles.btnAccept]}
            onPress={() => handleAccept(item.id)}
            disabled={actionLoading === item.id}
        >
            {actionLoading === item.id ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Text style={styles.btnTextAccept}>Accepter</Text>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {user.nom} 🛠️</Text>
        <Text style={styles.subtitle}>
            {loading ? 'Chargement...' : `Vous avez ${missions.length} demande(s) en attente`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196f3" />
        </View>
      ) : (
        <FlatList 
            data={missions}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMission}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196f3']} />
            }
            ListEmptyComponent={
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="inbox-outline" size={80} color="#ddd" />
                    <Text style={styles.emptyText}>Aucune nouvelle demande.</Text>
                    <Text style={styles.emptySubText}>Tirez vers le bas pour actualiser</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  subtitle: { color: '#7F8C8D', marginTop: 5, fontSize: 16 },
  list: { padding: 15, paddingBottom: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity:0.05, shadowRadius:5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  clientInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#2196f3', fontWeight: 'bold', fontSize: 18 },
  clientName: { fontWeight: '700', fontSize: 16, color: '#333' },
  address: { color: '#777', fontSize: 13, marginTop: 2 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  
  body: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dateText: { marginLeft: 8, fontWeight: '600', color: '#444', fontSize: 14 },
  description: { color: '#555', fontSize: 14, lineHeight: 20, marginTop: 4 },
  
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnRefuse: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' },
  btnTextRefuse: { color: '#D32F2F', fontWeight: '700', fontSize: 15 },
  btnAccept: { backgroundColor: '#2196f3', elevation: 2 },
  btnTextAccept: { color: '#fff', fontWeight: '700', fontSize: 15 },
  
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#999', fontSize: 18, fontWeight: '600', marginTop: 10 },
  emptySubText: { color: '#ccc', fontSize: 14, marginTop: 5 },
});

export default ProHomeScreen;