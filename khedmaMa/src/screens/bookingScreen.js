// src/screens/bookingScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';

const BookingScreen = ({ route, navigation }) => {
  const { proData, currentUser } = route.params || {};

  // Protection données
  if (!proData || !currentUser) {
      return (
        <View style={styles.center}>
            <Text>Erreur : Données manquantes</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{color:'blue'}}>Retour</Text></TouchableOpacity>
        </View>
      );
  }
  
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    const cleanDate = date.trim();
    const cleanDesc = description.trim();


    if (cleanDate.length < 2) {
      Alert.alert("Date manquante", "Veuillez indiquer quand vous souhaitez l'intervention.");
      return;
    }
    if (cleanDesc.length < 5) {
      Alert.alert("Description trop courte", "Veuillez décrire le problème en quelques mots.");
      return;
    }

    setLoading(true);

    try {
        // A REMPLACEr PAR  IP LOCALE
        const API_URL = 'http://10.181.182.244:3000/api/book'; 

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientId: currentUser.id,
                proId: proData.id, 
                date: cleanDate,
                description: cleanDesc
            })
        });

        const json = await response.json();

        if (response.ok) {
            Alert.alert(
                "Succès ! 🎉",
                "Votre demande a été envoyée au prestataire.",
                [{ text: "Super", onPress: () => navigation.navigate('HomeApp') }] 
            );
        } else {
            throw new Error(json.error || "Erreur inconnue");
        }

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
            <Text style={styles.proPrice}>{proData.tarifHoraire ? proData.tarifHoraire + ' DH/h' : 'Tarif sur devis'}</Text>
        </View>

        <Text style={styles.label}>Date et Heure souhaitées :</Text>
        <TextInput
            style={styles.input}
            placeholder="ex: Demain à 14h00" 
            placeholderTextColor="#999"
            value={date}
            onChangeText={setDate}
        />

        <Text style={styles.label}>Le problème :</Text>
        <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre panne en détail..."
            placeholderTextColor="#999"
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
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#eee', color: '#000' },
  textArea: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, height: 100, borderWidth: 1, borderColor: '#eee', textAlignVertical: 'top', color: '#000' },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#f0f0f0' },
  confirmButton: { backgroundColor: '#2196f3', padding: 15, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default BookingScreen;