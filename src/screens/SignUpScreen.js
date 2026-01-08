import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';

// 1. Imports Firebase & Neo4j
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; 
import { runCypher } from '../services/neo4jService';

// 2. Import du menu déroulant (N'oublie pas l'installation !)
import { Picker } from '@react-native-picker/picker';

// --- LISTE DES MÉTIERS DISPONIBLES ---
const LISTE_METIERS = [
  "Plombier",
  "Électricien",
  "Déménageur",
  "Peintre",
  "Jardinier",
  "Ménage",
];

const SignUpScreen = ({ navigation }) => {
  // --- État pour le Rôle ---
  const [role, setRole] = useState('CLIENT'); 

  // --- Champs Communs ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');

  // --- Champ Client ---
  const [adresse, setAdresse] = useState('');

  // --- Champs Prestataire ---
  const [cin, setCin] = useState('');
  // On initialise avec le premier métier de la liste par défaut
  const [metier, setMetier] = useState(LISTE_METIERS[0]); 
  const [tarif, setTarif] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !nom || !telephone) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires.");
      return;
    }

    setLoading(true);

    try {
      // ÉTAPE 1 : Auth Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      // ÉTAPE 2 : Requête Neo4j
      let cypherQuery = '';
      let params = {
        id: uid,
        nom: nom,
        email: email,
        telephone: telephone,
        dateInscription: new Date().toISOString()
      };

      if (role === 'CLIENT') {
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
        params.metier = metier; // Utilise la valeur du Picker
        params.tarif = parseFloat(tarif);
      }

      // ÉTAPE 3 : Exécution
      await runCypher(cypherQuery, params);

      Alert.alert("Succès", "Compte créé avec succès !", [
        // J'ai mis 'HomeApp' car c'est le nom qu'on a défini ensemble avant
        { text: "OK", onPress: () => navigation.replace('HomeApp') } 
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
            
            {/* 👇 ICI : LE SELECTEUR DE MÉTIER 👇 */}
            <Text style={styles.label}>Sélectionnez votre métier :</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={metier}
                onValueChange={(itemValue) => setMetier(itemValue)}
                style={styles.picker}
              >
                {LISTE_METIERS.map((m, index) => (
                  <Picker.Item key={index} label={m} value={m} />
                ))}
              </Picker>
            </View>

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
  label: { fontSize: 14, color: '#666', marginBottom: 5, marginLeft: 5 },

  // Style du Switcher
  roleContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 4 },
  roleButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  roleButtonActive: { backgroundColor: '#2196f3' },
  roleText: { fontWeight: 'bold', color: '#555' },
  roleTextActive: { color: '#fff' },

  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  
  // NOUVEAU : Style pour le Picker (Menu déroulant)
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
    // Sur Android le picker a besoin d'une hauteur définie parfois, sur iOS il est différent
    ...Platform.select({
        ios: { height: 150, justifyContent: 'center' },
        android: { height: 55, justifyContent: 'center' }
    })
  },
  picker: {
    width: '100%',
    height: '100%',
  },

  button: { backgroundColor: '#2196f3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196f3', textAlign: 'center' }
});

export default SignUpScreen;