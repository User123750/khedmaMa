// src/screens/bookingScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';

// Import du service Neo4j
import { runCypher } from '../services/neo4jService';

const BookingScreen = ({ route, navigation }) => {
  // On récupère les deux acteurs de la réservation
  const { proData, currentUser } = route.params || {};

  // Protection contre le crash si les données manquent
  if (!proData || !currentUser) {
      return (
        <View style={styles.center}>
            <Text>Erreur : Données manquantes</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{color:'blue'}}>Retour</Text></TouchableOpacity>
        </View>
      );
  }
  
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // Tu pourras mettre un DatePicker plus tard
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (description.length < 5 || date.length < 3) {
      Alert.alert("Oups", "Veuillez indiquer une date et décrire le problème.");
      return;
    }

    setLoading(true);

    try {
        // --- REQUÊTE CYPHER ---
        // On crée une relation :RESERVE entre le Client et le Prestataire
        const query = `
            MATCH (c:Client {id: $clientId})
            MATCH (p:Prestataire {id: $proId})
            CREATE (c)-[r:RESERVE {
                datePrevue: $date,
                description: $description,
                status: 'EN_ATTENTE',
                dateCreation: datetime()
            }]->(p)
            RETURN r
        `;

        const params = {
            clientId: currentUser.id,
            proId: proData.id,
            date: date,
            description: description
        };

        await runCypher(query, params);

        Alert.alert(
            "Succès ! 🎉",
            "Votre demande a été envoyée au prestataire.",
            [{ text: "Super", onPress: () => navigation.navigate('HomeApp') }]
        );

    } catch (error) {
        console.error("Erreur réservation:", error);
        Alert.alert("Erreur", "Impossible d'envoyer la demande. Vérifiez votre connexion.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Finaliser la demande</Text>
        
        <View style={styles.proCard}>
            <Text style={styles.proName}>Avec : {proData.nom}</Text>
            <Text style={styles.proJob}>{proData.metier}</Text>
            <Text style={styles.proPrice}>{proData.tarifHoraire ? proData.tarifHoraire + ' DH/h' : 'Tarif non défini'}</Text>
        </View>

        <Text style={styles.label}>Date et Heure souhaitées :</Text>
        <TextInput
            style={styles.input}
            placeholder="ex: Demain à 14h00"
            value={date}
            onChangeText={setDate}
        />

        <Text style={styles.label}>Le problème :</Text>
        <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre panne en détail..."
            multiline={true}
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmOrder}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Confirmer la demande</Text>
            )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  proCard: { backgroundColor: '#f0f8ff', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#e1f5fe' },
  proName: { fontSize: 18, fontWeight: 'bold', color: '#0277bd' },
  proJob: { color: '#555', marginTop: 2 },
  proPrice: { color: '#333', fontWeight: 'bold', marginTop: 5 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  textArea: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, height: 100, borderWidth: 1, borderColor: '#eee', textAlignVertical: 'top' },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#f0f0f0' },
  confirmButton: { backgroundColor: '#2196f3', padding: 15, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default BookingScreen;