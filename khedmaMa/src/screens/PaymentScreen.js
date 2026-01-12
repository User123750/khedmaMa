// src/screens/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Switch, 
  Alert,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { runCypher } from '../services/neo4jService';

const COLORS = {
  primary: '#2196f3',
  background: '#f8f9fa',
  white: '#fff',
  text: '#333',
  gray: '#777',
  red: '#ff4444',
  overlay: 'rgba(0,0,0,0.5)'
};

export default function PaymentScreen({ route, navigation }) {
  const user = route.params?.user || route.params?.currentUser;

  const [cashEnabled, setCashEnabled] = useState(true);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire
  const [modalVisible, setModalVisible] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',   
    expiry: '',   
    cvc: ''       
  });
  const [savingCard, setSavingCard] = useState(false);

  // --- 1. CHARGEMENT ---
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!user) {
          setLoading(false);
          return;
      }
      
      try {
        const query = `
          MATCH (u:Utilisateur {id: $uid})
          OPTIONAL MATCH (u)-[:A_MOYEN_PAIEMENT]->(c:CarteBancaire)
          RETURN u.paiementEspeces AS cashPref, c
        `;
        const records = await runCypher(query, { uid: user.id });

        if (records.length > 0) {
          const pref = records[0].get('cashPref');
          setCashEnabled(pref !== null ? pref : true);

          const loadedCards = records
            .map(r => r.get('c') ? r.get('c').properties : null)
            .filter(c => c !== null);
          
          setCards(loadedCards);
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, [user]);

  // --- 2. SWITCH ESPÈCES ---
  const toggleCash = async (value) => {
    setCashEnabled(value);
    try {
      if(user) {
        await runCypher(`MATCH (u:Utilisateur {id: $uid}) SET u.paiementEspeces = $value`, { uid: user.id, value });
      }
    } catch (e) { console.error(e); }
  };

  // --- 3. SAUVEGARDER LA CARTE 
  const handleSaveCard = async () => {
    if (!user) {
        Alert.alert("Erreur", "Utilisateur non identifié.");
        return;
    }

    if (newCard.number.length < 15 || !newCard.expiry.includes('/') || newCard.cvc.length < 3) {
        Alert.alert("Erreur", "Veuillez vérifier les informations.");
        return;
    }

    setSavingCard(true);
    
    // Détection Marque
    let detectedBrand = 'credit-card';
    if (newCard.number.startsWith('4')) detectedBrand = 'visa';
    if (newCard.number.startsWith('5')) detectedBrand = 'mastercard';

    const last4Digits = newCard.number.slice(-4);
    const generatedId = Math.random().toString(36).substr(2, 9);

    const cardToDisplay = {
        id: generatedId,
        brand: detectedBrand,
        last4: last4Digits,
        expiry: newCard.expiry
    };

    try {
        // ✅ MISE À JOUR IMPORTANTE ICI :
        // On ajoute "SET u.hasPaymentMethod = true" pour débloquer la réservation
        const query = `
            MATCH (u:Utilisateur {id: $uid})
            CREATE (c:CarteBancaire {
                id: $cardId,   
                brand: $brand,
                last4: $last4,
                expiry: $expiry
            })
            CREATE (u)-[:A_MOYEN_PAIEMENT]->(c)
            SET u.hasPaymentMethod = true 
        `;
        
        const params = { 
            uid: user.id, 
            cardId: generatedId,
            brand: detectedBrand,
            last4: last4Digits,
            expiry: newCard.expiry
        };

        await runCypher(query, params);

        setCards([...cards, cardToDisplay]);
        setModalVisible(false);
        setNewCard({ number: '', expiry: '', cvc: '' }); 
        Alert.alert("Succès", "Carte ajoutée ! Vous pouvez maintenant réserver.");

    } catch (error) {
        console.error("Erreur sauvegarde carte:", error);
        Alert.alert("Erreur", "Impossible d'enregistrer la carte");
    } finally {
        setSavingCard(false);
    }
  };

  // --- 4. SUPPRESSION 
  const handleDeleteCard = (id) => {
    Alert.alert("Supprimer", "Retirer cette carte ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
          const remainingCards = cards.filter(c => c.id !== id);
          setCards(remainingCards);

          if(user) {
            try {
              // Cette requête vérifie s'il reste des cartes. Si 0, elle bloque le paiement.
              const query = `
                  MATCH (u:Utilisateur {id: $uid})-[r]->(c:CarteBancaire {id: $cid})
                  DELETE r, c
                  WITH u
                  OPTIONAL MATCH (u)-[:A_MOYEN_PAIEMENT]->(other)
                  WITH u, count(other) as nbCartes
                  SET u.hasPaymentMethod = (nbCartes > 0)
              `;
              await runCypher(query, { uid: user.id, cid: id });
            } catch (e) {
              console.error("Erreur suppression:", e);
              Alert.alert("Erreur", "Problème lors de la suppression");
            }
          }
      }}
    ]);
  };

  const renderCard = ({ item }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardLeft}>
        <MaterialCommunityIcons 
          name={item.brand.includes('visa') ? 'credit-card' : (item.brand.includes('master') ? 'credit-card-multiple' : 'credit-card-outline')} 
          size={32} 
          color={COLORS.primary} 
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardText}>•••• •••• •••• {item.last4}</Text>
          <Text style={styles.cardSubText}>Expire le {item.expiry} • {item.brand.toUpperCase()}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteCard(item.id)}>
        <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.red} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <Text style={styles.sectionTitle}>Préférences</Text>
      <View style={styles.optionContainer}>
        <View style={styles.optionLeft}>
          <MaterialCommunityIcons name="cash" size={24} color="#4CAF50" style={{marginRight: 10}} />
          <Text style={styles.optionText}>Payer en espèces</Text>
        </View>
        <Switch value={cashEnabled} onValueChange={toggleCash} trackColor={{true: COLORS.primary}}/>
      </View>

      <Text style={styles.sectionTitle}>Mes cartes</Text>
      
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{marginTop: 20}} />
      ) : (
        <FlatList
            data={cards}
            keyExtractor={item => item.id}
            renderItem={renderCard}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucune carte enregistrée.</Text>}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.addButtonText}>Ajouter une carte</Text>
      </TouchableOpacity>

      {/* --- FORMULAIRE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Carte</Text>
            
            <Text style={styles.label}>Numéro de carte</Text>
            <TextInput 
                style={styles.input} 
                placeholder="0000 0000 0000 0000" 
                keyboardType="numeric"
                maxLength={19}
                value={newCard.number}
                onChangeText={(t) => setNewCard({...newCard, number: t})}
            />

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>Expiration</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="MM/AA" 
                        maxLength={5}
                        value={newCard.expiry}
                        onChangeText={(t) => setNewCard({...newCard, expiry: t})}
                    />
                </View>
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>CVC</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="123" 
                        keyboardType="numeric"
                        maxLength={3}
                        secureTextEntry={true}
                        value={newCard.cvc}
                        onChangeText={(t) => setNewCard({...newCard, cvc: t})}
                    />
                </View>
            </View>

            <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                    <Text style={{color: COLORS.gray}}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleSaveCard} style={styles.saveBtn} disabled={savingCard}>
                    {savingCard ? <ActivityIndicator color="#fff"/> : <Text style={{color: '#fff', fontWeight: 'bold'}}>Enregistrer</Text>}
                </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  optionContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: 15, borderRadius: 12, alignItems: 'center' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionText: { fontSize: 16 },
  cardItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { marginLeft: 15 },
  cardText: { fontWeight: 'bold', fontSize: 16 },
  cardSubText: { color: COLORS.gray, fontSize: 12 },
  emptyText: { textAlign: 'center', color: COLORS.gray, marginTop: 20 },
  addButton: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { color: COLORS.gray, marginBottom: 5, fontSize: 12 },
  input: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelBtn: { padding: 10, marginRight: 15 },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }
});