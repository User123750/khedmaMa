// src/screens/SupportScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FAQItem = ({ question, answer }) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>{question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </View>
);

export default function SupportScreen() {
  
  // Fonction pour simuler un appel
  const handleCall = () => {
    // Sur un vrai téléphone, ça ouvrirait l'appli téléphone
    // Linking.openURL('tel:+212600000000'); 
    alert('Appel vers le service client...');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      
      {/* En-tête Contact */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Besoin d'aide ?</Text>
        <Text style={styles.headerSub}>Notre équipe est là pour vous 24/7.</Text>
        
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
            <MaterialCommunityIcons name="phone" size={24} color="#fff" />
            <Text style={styles.btnText}>Appeler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D366' }]}>
            <MaterialCommunityIcons name="whatsapp" size={24} color="#fff" />
            <Text style={styles.btnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ */}
      <Text style={styles.sectionTitle}>Questions Fréquentes</Text>
      
      <FAQItem 
        question="Comment annuler une réservation ?"
        answer="Allez dans l'onglet 'Activité', sélectionnez la commande et cliquez sur 'Annuler' au moins 24h à l'avance."
      />
      <FAQItem 
        question="Les prestataires sont-ils vérifiés ?"
        answer="Oui, tous nos professionnels passent un processus de vérification rigoureux (Identité, Diplômes, Casier judiciaire)."
      />
      <FAQItem 
        question="Quels moyens de paiement acceptez-vous ?"
        answer="Vous pouvez payer en espèces à la fin du service ou par carte bancaire via l'application."
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  headerBox: {
    backgroundColor: '#2196f3',
    padding: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  headerSub: { color: '#e3f2fd', marginBottom: 20 },
  contactRow: { flexDirection: 'row', gap: 15 },
  contactBtn: {
    flexDirection: 'row', backgroundColor: '#1976D2', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 30, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 20, marginBottom: 15 },
  faqItem: {
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, padding: 15, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  question: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  answer: { fontSize: 14, color: '#666', lineHeight: 20 },
});