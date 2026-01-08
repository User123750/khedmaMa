// src/screens/PaymentScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Switch, 
  Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#2196f3',
  background: '#f8f9fa',
  white: '#fff',
  text: '#333',
  gray: '#777',
  red: '#ff4444'
};

export default function PaymentScreen({ navigation }) {
  // État pour le paiement en espèces
  const [cashEnabled, setCashEnabled] = useState(true);

  // Simulation de cartes enregistrées
  const [cards, setCards] = useState([
    { id: '1', brand: 'visa', last4: '4242', expiry: '12/25' },
    { id: '2', brand: 'mastercard', last4: '8899', expiry: '09/26' },
  ]);

  // Fonction pour supprimer une carte (simulation)
  const handleDeleteCard = (id) => {
    Alert.alert(
      "Supprimer la carte",
      "Êtes-vous sûr de vouloir retirer ce moyen de paiement ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => setCards(cards.filter(card => card.id !== id))
        }
      ]
    );
  };

  // Rendu d'une carte bancaire
  const renderCard = ({ item }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardLeft}>
        <MaterialCommunityIcons 
          name={item.brand === 'visa' ? 'credit-card' : 'credit-card-outline'} 
          size={32} 
          color={COLORS.primary} 
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardText}>•••• •••• •••• {item.last4}</Text>
          <Text style={styles.cardSubText}>Expire le {item.expiry}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteCard(item.id)}>
        <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.red} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* SECTION 1 : Espèces */}
      <Text style={styles.sectionTitle}>Préférences de paiement</Text>
      <View style={styles.optionContainer}>
        <View style={styles.optionLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="cash" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.optionText}>Payer en espèces</Text>
        </View>
        <Switch 
          value={cashEnabled} 
          onValueChange={setCashEnabled}
          trackColor={{ false: "#767577", true: COLORS.primary }}
        />
      </View>
      <Text style={styles.note}>
        Payez directement le prestataire à la fin du service.
      </Text>

      {/* SECTION 2 : Cartes Bancaires */}
      <Text style={styles.sectionTitle}>Mes cartes</Text>
      
      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune carte enregistrée.</Text>
        }
      />

      {/* Bouton Ajouter */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => Alert.alert("Bientôt", "La page d'ajout de carte sera la prochaine étape !")}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.addButtonText}>Ajouter une carte</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    padding: 8,
    borderRadius: 8,
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  note: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
    marginLeft: 5,
  },
  listContainer: {
    marginTop: 5,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: 15,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardSubText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 20,
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});