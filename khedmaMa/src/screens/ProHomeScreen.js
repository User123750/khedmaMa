import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, 
  ActivityIndicator, RefreshControl, SafeAreaView, Modal, TextInput 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { runCypher } from '../services/neo4jService';

const ProHomeScreen = ({ route, navigation }) => {
  const user = route.params?.user || { nom: 'Pro', id: '' };
  
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // --- ÉTATS POUR LA MODAL (Saisie des heures) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [hoursInput, setHoursInput] = useState('1'); // Par défaut 1h

  // 🔄 1. Récupérer les réservations
  const fetchMissions = async () => {
    try {
      const query = `
        MATCH (p:Prestataire {id: $id})<-[r:RESERVE]-(c:Client)
        RETURN c, r, id(r) as relId, p.tarifHoraire as tarif
        ORDER BY r.dateCreation DESC
      `;

      const records = await runCypher(query, { id: user.id });

      const parsedMissions = records.map(record => {
        const client = record.get('c').properties;
        const resa = record.get('r').properties;
        const relationId = record.get('relId').toString(); 
        const tarif = record.get('tarif') ? record.get('tarif').toNumber ? record.get('tarif').toNumber() : record.get('tarif') : 100;

        return {
          id: relationId, 
          clientName: client.nom,
          adresse: client.adresse || 'Adresse client',
          date: resa.datePrevue || 'Date inconnue',
          description: resa.description || 'Aucune description',
          status: resa.status || 'EN_ATTENTE',
          tarif: tarif,
          prixFinal: resa.prix ? (resa.prix.toNumber ? resa.prix.toNumber() : resa.prix) : null, 
          rawClient: client
        };
      });

      setMissions(parsedMissions);
    } catch (error) {
      console.error("Erreur fetch missions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMissions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMissions();
  };

  // --- LOGIQUE DES ACTIONS ---

  const handleAccept = async (relationId) => {
    setActionLoading(relationId);
    try {
      const query = `MATCH ()-[r:RESERVE]->() WHERE id(r) = toInteger($relId) SET r.status = 'ACCEPTE' RETURN r`;
      await runCypher(query, { relId: relationId });
      setMissions(prev => prev.map(m => m.id === relationId ? { ...m, status: 'ACCEPTE' } : m));
    } catch (error) { console.error(error); Alert.alert("Erreur", "Impossible d'accepter."); } 
    finally { setActionLoading(null); }
  };

  const handleRefuse = async (relationId) => {
    Alert.alert("Refuser", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Refuser", style: "destructive", onPress: async () => {
          setActionLoading(relationId);
          try {
            const query = `MATCH ()-[r:RESERVE]->() WHERE id(r) = toInteger($relId) SET r.status = 'REFUSE' RETURN r`;
            await runCypher(query, { relId: relationId });
            setMissions(prev => prev.map(m => m.id === relationId ? { ...m, status: 'REFUSE' } : m));
          } catch (error) { console.error(error); } finally { setActionLoading(null); }
        }}
    ]);
  };

  // 🟢 1. OUVERTURE DE LA MODAL
  const openFinishModal = (item) => {
    setSelectedMission(item);
    setHoursInput('1'); // On remet à 1 par défaut
    setModalVisible(true);
  };

  // 🟢 2. VALIDATION DU PAIEMENT (Appelé par la Modal)
  const confirmFinishMission = async () => {
    if (!selectedMission) return;
    
    // Conversion et calcul
    const hours = parseFloat(hoursInput.replace(',', '.')); // Gère 1.5 ou 1,5
    if (isNaN(hours) || hours <= 0) {
        Alert.alert("Erreur", "Veuillez entrer un nombre d'heures valide.");
        return;
    }

    const prixTotal = hours * selectedMission.tarif;

    setModalVisible(false); // On ferme la modal
    setActionLoading(selectedMission.id); // On lance le chargement

    try {
        const query = `
        MATCH ()-[r:RESERVE]->() 
        WHERE id(r) = toInteger($relId)
        SET r.status = 'TERMINE', 
            r.prix = $montant,
            r.duree = $duree,
            r.dateFin = datetime()
        RETURN r
        `;
        
        await runCypher(query, { 
            relId: selectedMission.id, 
            montant: prixTotal,
            duree: hours
        });

        Alert.alert("Succès 🎉", `Mission terminée !\nDurée : ${hours}h\nTotal encaissé : ${prixTotal} DH`);

        // Mise à jour de l'affichage local
        setMissions(prev => prev.map(m => 
            m.id === selectedMission.id ? { ...m, status: 'TERMINE', prixFinal: prixTotal } : m
        ));

    } catch (error) {
        console.error("Erreur finish:", error);
        Alert.alert("Erreur", "Impossible de valider la fin de mission.");
    } finally {
        setActionLoading(null);
        setSelectedMission(null);
    }
  };

  const renderMission = ({ item }) => {
    const isPending = item.status === 'EN_ATTENTE';
    const isAccepted = item.status === 'ACCEPTE' || item.status === 'EN_COURS';
    const isTerminated = item.status === 'TERMINE';
    const isRefused = item.status === 'REFUSE';

    return (
      <View style={[styles.card, isRefused && styles.cardRefused, isTerminated && styles.cardTerminated]}>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
               <View style={[styles.avatarPlaceholder, isTerminated && {backgroundColor:'#e8f5e9'}]}>
                  <Text style={styles.avatarText}>
                    {item.clientName ? item.clientName.charAt(0).toUpperCase() : '?'}
                  </Text>
               </View>
               <View>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                  <Text style={styles.address}>{item.adresse}</Text>
               </View>
          </View>
          <View style={styles.statusBadge}>
             {isPending && <Text style={{color:'#fbc02d', fontWeight:'bold'}}>En attente</Text>}
             {isAccepted && <Text style={{color:'#2196f3', fontWeight:'bold'}}>En cours</Text>}
             {isRefused && <Text style={{color:'#d32f2f', fontWeight:'bold'}}>Refusé</Text>}
             {isTerminated && <Text style={{color:'#2e7d32', fontWeight:'bold'}}>Terminé ✅</Text>}
          </View>
        </View>
  
        <View style={styles.body}>
          <View style={styles.row}>
              <MaterialCommunityIcons name="calendar-clock" size={18} color="#666" />
              <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <Text style={styles.description}>{item.description}</Text>
          
          {isTerminated && (
             <Text style={styles.finalPrice}>💰 Encaissé : {item.prixFinal} DH</Text>
          )}
        </View>
  
        <View style={styles.actions}>
           {isPending && (
             <>
                <TouchableOpacity style={[styles.btn, styles.btnRefuse]} onPress={() => handleRefuse(item.id)} disabled={!!actionLoading}>
                    <Text style={styles.btnTextRefuse}>Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={() => handleAccept(item.id)} disabled={!!actionLoading}>
                    {actionLoading === item.id ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnTextAccept}>Accepter</Text>}
                </TouchableOpacity>
             </>
           )}

           {isAccepted && (
             // C'est ici qu'on appelle la modale
             <TouchableOpacity style={[styles.btn, styles.btnFinish]} onPress={() => openFinishModal(item)} disabled={!!actionLoading}>
                 {actionLoading === item.id ? <ActivityIndicator color="#fff"/> : (
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <MaterialCommunityIcons name="check-all" size={20} color="white" style={{marginRight:5}} />
                        <Text style={styles.btnTextAccept}>Terminer</Text>
                    </View>
                 )}
             </TouchableOpacity>
           )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- MODAL DE SAISIE DES HEURES --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Fin de l'intervention</Text>
            <Text style={styles.modalSubtitle}>Combien d'heures avez-vous travaillé ?</Text>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={setHoursInput}
                    value={hoursInput}
                    keyboardType="numeric"
                    autoFocus={true}
                />
                <Text style={styles.unitText}>Heures</Text>
            </View>

            {/* Calcul dynamique du prix */}
            <View style={styles.calcPreview}>
                <Text style={styles.calcText}>
                    {hoursInput || 0} h  x  {selectedMission?.tarif || 0} DH/h
                </Text>
                <Text style={styles.totalText}>
                    Total : { (parseFloat(hoursInput) * (selectedMission?.tarif || 0)).toFixed(0) } DH
                </Text>
            </View>

            <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.textCancel}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.btnConfirm]} onPress={confirmFinishMission}>
                    <Text style={styles.textConfirm}>Valider & Encaisser</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {user.nom} 🛠️</Text>
        <Text style={styles.subtitle}>Gestion des missions</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2196f3" /></View>
      ) : (
        <FlatList 
            data={missions}
            keyExtractor={item => item.id}
            renderItem={renderMission}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196f3']} />}
            ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Aucune mission.</Text></View>}
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
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardRefused: { opacity: 0.6, backgroundColor: '#f5f5f5' },
  cardTerminated: { borderColor: '#4CAF50', borderWidth: 1 }, 
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  clientInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#2196f3', fontWeight: 'bold', fontSize: 18 },
  clientName: { fontWeight: '700', fontSize: 16, color: '#333' },
  address: { color: '#777', fontSize: 13, marginTop: 2 },
  statusBadge: { marginLeft: 5 },

  body: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dateText: { marginLeft: 8, fontWeight: '600', color: '#444', fontSize: 14 },
  description: { color: '#555', fontSize: 14, lineHeight: 20 },
  finalPrice: { color: '#2e7d32', fontWeight:'bold', marginTop:10, fontSize:16 },
  
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnRefuse: { backgroundColor: '#FFEBEE' },
  btnTextRefuse: { color: '#D32F2F', fontWeight: '700' },
  btnAccept: { backgroundColor: '#2196f3' },
  btnTextAccept: { color: '#fff', fontWeight: '700' },
  btnFinish: { backgroundColor: '#4CAF50' },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#999', fontSize: 18 },

  // --- STYLES MODAL ---
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { borderBottomWidth: 1, borderBottomColor: '#2196f3', fontSize: 30, width: 80, textAlign: 'center', color: '#333', fontWeight: 'bold' },
  unitText: { fontSize: 18, color: '#666', marginLeft: 10 },
  calcPreview: { width: '100%', backgroundColor: '#f1f8e9', padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
  calcText: { fontSize: 14, color: '#555' },
  totalText: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginTop: 5 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  modalBtn: { borderRadius: 10, padding: 12, elevation: 2, width: '45%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#e0e0e0' },
  btnConfirm: { backgroundColor: '#2196f3' },
  textCancel: { color: '#333', fontWeight: 'bold' },
  textConfirm: { color: 'white', fontWeight: 'bold' }
});

export default ProHomeScreen;