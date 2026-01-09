import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; 
import { runCypher } from '../services/neo4jService';
import { Picker } from '@react-native-picker/picker';

const LISTE_METIERS = ["Plombier", "Électricien", "Déménageur", "Peintre", "Jardinier", "Ménage"];

const SignUpScreen = ({ navigation }) => {
  const [role, setRole] = useState('CLIENT'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState(''); // Client
  const [cin, setCin] = useState(''); // Pro
  const [metier, setMetier] = useState(LISTE_METIERS[0]); // Pro
  const [tarif, setTarif] = useState(''); // Pro
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !nom || !telephone) {
      Alert.alert("Erreur", "Champs obligatoires manquants.");
      return;
    }
    setLoading(true);

    try {
      // 1. Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Neo4j & Objet Local
      let cypherQuery = '';
      
      // On prépare l'objet pour la navigation immédiate
      const newUser = {
          id: uid,
          nom,
          email,
          telephone,
          role: role,
          dateInscription: new Date().toISOString()
      };

      let params = { ...newUser };

      if (role === 'CLIENT') {
        cypherQuery = `CREATE (u:Utilisateur:Client {id: $id, nom: $nom, email: $email, telephone: $telephone, adresse: $adresse, role: 'CLIENT', dateInscription: datetime($dateInscription)}) RETURN u`;
        params.adresse = adresse;
        newUser.adresse = adresse;
      } else {
        cypherQuery = `CREATE (u:Utilisateur:Prestataire {id: $id, nom: $nom, email: $email, telephone: $telephone, cin: $cin, metier: $metier, tarifHoraire: $tarif, estDisponible: true, noteMoyenne: 0.0, role: 'PRESTATAIRE', dateInscription: datetime($dateInscription)}) RETURN u`;
        params.cin = cin;
        params.metier = metier;
        params.tarif = parseFloat(tarif);
        newUser.metier = metier;
      }

      await runCypher(cypherQuery, params);

      Alert.alert("Bienvenue !", "Compte créé avec succès.", [
        { 
            text: "C'est parti", 
            onPress: () => {
                // REDIRECTION SELON LE RÔLE
                if (role === 'PRESTATAIRE') {
                    navigation.replace('ProApp', { user: newUser });
                } else {
                    navigation.replace('HomeApp', { user: newUser });
                }
            } 
        }
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

        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, role === 'CLIENT' && styles.roleButtonActive]} onPress={() => setRole('CLIENT')}>
            <Text style={[styles.roleText, role === 'CLIENT' && styles.roleTextActive]}>Je suis Client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === 'PRESTATAIRE' && styles.roleButtonActive]} onPress={() => setRole('PRESTATAIRE')}>
            <Text style={[styles.roleText, role === 'PRESTATAIRE' && styles.roleTextActive]}>Je suis Prestataire</Text>
          </TouchableOpacity>
        </View>

        <TextInput placeholder="Nom complet" value={nom} onChangeText={setNom} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} autoCapitalize="none"/>
        <TextInput placeholder="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" style={styles.input} />
        <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

        {role === 'CLIENT' ? (
          <TextInput placeholder="Votre adresse" value={adresse} onChangeText={setAdresse} style={styles.input} />
        ) : (
          <View>
            <TextInput placeholder="N° CIN" value={cin} onChangeText={setCin} style={styles.input} />
            <Text style={styles.label}>Métier :</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={metier} onValueChange={setMetier} style={styles.picker}>
                {LISTE_METIERS.map((m, i) => <Picker.Item key={i} label={m} value={m} />)}
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
  label: { fontSize: 14, color: '#666', marginBottom: 5, marginLeft: 5 },
  roleContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 4 },
  roleButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  roleButtonActive: { backgroundColor: '#2196f3' },
  roleText: { fontWeight: 'bold', color: '#555' },
  roleTextActive: { color: '#fff' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  pickerContainer: {
    backgroundColor: '#f5f5f5', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 15,
    ...Platform.select({ ios: { height: 150, justifyContent: 'center' }, android: { height: 55, justifyContent: 'center' } })
  },
  picker: { width: '100%', height: '100%' },
  button: { backgroundColor: '#2196f3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196f3', textAlign: 'center' }
});

export default SignUpScreen;