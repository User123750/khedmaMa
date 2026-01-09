import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; 
import { runCypher } from '../services/neo4jService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    if(email === '' || password === '') {
        Alert.alert("Erreur", "Veuillez remplir tous les champs");
        return;
    }
    setLoading(true);

    try {
      // 1. Authentification Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log("Firebase Auth OK, UID:", uid);

      // 2. Récupération des données ET des Labels (Étiquettes)
      // On demande 'labels(u)' pour savoir si c'est :Client ou :Prestataire
      const query = `MATCH (u:Utilisateur {id: $uid}) RETURN u, labels(u) as etiquettes`;
      const records = await runCypher(query, { uid: uid });

      if (records.length > 0) {
        const record = records[0];
        const rawData = record.get('u').properties;
        const labels = record.get('etiquettes'); // Renvoie un tableau ex: ["Utilisateur", "Prestataire"]

        console.log("Labels trouvés :", labels);

        // DÉTECTION DU RÔLE BASÉE SUR LES LABELS (Plus fiable pour les anciens comptes)
        let userRole = 'CLIENT';
        if (labels.includes('Prestataire')) {
            userRole = 'PRESTATAIRE';
        } else if (rawData.role === 'PRESTATAIRE') {
            // Sécurité supplémentaire au cas où le label manque mais la propriété existe
            userRole = 'PRESTATAIRE';
        }

        const cleanUser = {
            id: rawData.id,
            nom: rawData.nom,
            email: rawData.email,
            telephone: rawData.telephone,
            role: userRole, // On force le rôle détecté via les labels
            metier: rawData.metier || '',
            cin: rawData.cin || '',
            tarifHoraire: rawData.tarifHoraire || 0,
            estDisponible: rawData.estDisponible || false
        };

        console.log(`Connexion de ${cleanUser.nom} | Rôle détecté : ${cleanUser.role}`);

        // 3. Redirection selon le rôle détecté
        if (cleanUser.role === 'PRESTATAIRE') {
            navigation.replace('ProApp', { user: cleanUser });
        } else {
            navigation.replace('HomeApp', { user: cleanUser });
        }

      } else {
        Alert.alert("Erreur", "Profil utilisateur introuvable dans Neo4j.");
      }

    } catch (error) {
      console.error("Erreur Login:", error);
      Alert.alert("Échec de connexion", "Vérifiez vos identifiants ou votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => { navigation.navigate('SignUpScreen'); };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
            <Text style={styles.logoText}>Khedma.ma 🇲🇦</Text>
            <Text style={styles.subtitle}>Votre expert à domicile</Text>
        </View>
        <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
                style={styles.input} 
                placeholder="ex: contact@gmail.com" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none"
            />
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput 
                style={styles.input} 
                placeholder="******" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={true} 
            />
            <TouchableOpacity style={[styles.loginButton, loading && {opacity: 0.7}]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Se connecter</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={goToSignUp}><Text style={styles.linkText}>Pas encore de compte ? Créer un compte</Text></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 50 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#2196f3', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray' },
  form: { width: '100%' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  loginButton: { backgroundColor: '#2196f3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20, elevation: 3 },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkText: { textAlign: 'center', color: '#2196f3', marginTop: 10 }
});

export default LoginScreen;