import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';

// 1. Imports Firebase & Neo4j
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; 
import { runCypher } from '../services/neo4jService';

const SignUpScreen = ({ navigation }) => {
  // --- État pour le Rôle (Client par défaut) ---
  const [role, setRole] = useState('CLIENT'); // ou 'PRESTATAIRE'

  // --- Champs Communs (Classe Utilisateur) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');

  // --- Champ Spécifique Client ---
  const [adresse, setAdresse] = useState('');

  // --- Champs Spécifiques Prestataire ---
  const [cin, setCin] = useState('');
  const [metier, setMetier] = useState('');
  const [tarif, setTarif] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validation basique
    if (!email || !password || !nom || !telephone) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires.");
      return;
    }

    setLoading(true);

    try {
      // ÉTAPE 1 : Création Auth Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      // ÉTAPE 2 : Préparation de la requête Neo4j selon le rôle
      let cypherQuery = '';
      let params = {
        id: uid,
        nom: nom,
        email: email,
        telephone: telephone,
        dateInscription: new Date().toISOString()
      };

      if (role === 'CLIENT') {
        // Création d'un nœud Client (Hérite de Utilisateur)
        // Note: On ajoute les deux labels :Utilisateur et :Client
        cypherQuery = `
          CREATE (u:Utilisateur:Client {
            id: $id,
            nom: $nom,
            email: $email,
            telephone: $telephone,
            adresse: $adresse,
            dateInscription: datetime($dateInscription)
          }) RETURN u
        `;
        params.adresse = adresse;
      } else {
        // Création d'un nœud Prestataire
        // On initialise noteMoyenne à 0 et estDisponible à true par défaut
        cypherQuery = `
          CREATE (u:Utilisateur:Prestataire {
            id: $id,
            nom: $nom,
            email: $email,
            telephone: $telephone,
            cin: $cin,
            metier: $metier,
            tarifHoraire: $tarif,
            estDisponible: true,
            noteMoyenne: 0.0,
            dateInscription: datetime($dateInscription)
          }) RETURN u
        `;
        params.cin = cin;
        params.metier = metier;
        params.tarif = parseFloat(tarif); // Important : convertir en nombre
      }

      // ÉTAPE 3 : Exécution Neo4j
      await runCypher(cypherQuery, params);

      Alert.alert("Succès", "Compte créé avec succès !", [
        { text: "OK", onPress: () => navigation.replace('HomeScreen') }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.title}>Créer un compte</Text>

        {/* --- SÉLECTEUR DE RÔLE --- */}
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'CLIENT' && styles.roleButtonActive]}
            onPress={() => setRole('CLIENT')}
          >
            <Text style={[styles.roleText, role === 'CLIENT' && styles.roleTextActive]}>Je suis Client</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'PRESTATAIRE' && styles.roleButtonActive]}
            onPress={() => setRole('PRESTATAIRE')}
          >
            <Text style={[styles.roleText, role === 'PRESTATAIRE' && styles.roleTextActive]}>Je suis Prestataire</Text>
          </TouchableOpacity>
        </View>

        {/* --- CHAMPS COMMUNS --- */}
        <TextInput placeholder="Nom complet" value={nom} onChangeText={setNom} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} autoCapitalize="none"/>
        <TextInput placeholder="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" style={styles.input} />
        <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

        {/* --- CHAMPS SPÉCIFIQUES --- */}
        {role === 'CLIENT' ? (
          <View>
            <Text style={styles.sectionTitle}>Adresse du client</Text>
            <TextInput placeholder="Votre adresse" value={adresse} onChangeText={setAdresse} style={styles.input} />
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Infos Professionnelles</Text>
            <TextInput placeholder="N° CIN" value={cin} onChangeText={setCin} style={styles.input} />
            <TextInput placeholder="Métier (ex: Plombier)" value={metier} onChangeText={setMetier} style={styles.input} />
            <TextInput placeholder="Tarif Horaire (DH)" value={tarif} onChangeText={setTarif} keyboardType="numeric" style={styles.input} />
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>S'inscrire</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={{marginTop: 20}}>
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2196f3', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 10 },
  
  // Style du Switcher
  roleContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 4 },
  roleButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  roleButtonActive: { backgroundColor: '#2196f3' },
  roleText: { fontWeight: 'bold', color: '#555' },
  roleTextActive: { color: '#fff' },

  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#2196f3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196f3', textAlign: 'center' }
});

export default SignUpScreen;