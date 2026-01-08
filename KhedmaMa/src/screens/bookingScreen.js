// src/screens/BookingScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

const BookingScreen = ({ route, navigation }) => {
  // On vérifie si on a bien reçu les données, sinon on met un objet vide pour éviter le crash
  const proData = route.params ? route.params.proData : { name: 'Inconnu', job: 'Service' };
  
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = () => {
    if (description.length < 5) {
      Alert.alert("Oups", "Veuillez décrire le problème.");
      return;
    }

    setLoading(true);

    // Simulation d'envoi
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Succès ! 🎉",
        "Votre demande a été envoyée.",
        [{ text: "OK", onPress: () => navigation.popToTop() }]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Finaliser la demande</Text>
        
        <View style={styles.proCard}>
            <Text style={styles.proName}>Avec : {proData.name}</Text>
            <Text style={styles.proJob}>{proData.job}</Text>
        </View>

        <Text style={styles.label}>Le problème :</Text>
        <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre panne..."
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
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Confirmer</Text>
            )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  proCard: { backgroundColor: '#f0f8ff', padding: 15, borderRadius: 10, marginBottom: 20 },
  proName: { fontSize: 18, fontWeight: 'bold' },
  proJob: { color: '#555' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  textArea: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, height: 100, borderWidth: 1, borderColor: '#eee' },
  footer: { padding: 20 },
  confirmButton: { backgroundColor: '#2196f3', padding: 15, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default BookingScreen;