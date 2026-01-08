// src/screens/LoginScreen.js
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log("Firebase Auth OK, UID:", uid);

      // On récupère les infos Neo4j
      const query = `MATCH (u:Utilisateur {id: $uid}) RETURN u`;
      const records = await runCypher(query, { uid: uid });

      if (records.length > 0) {
        const rawData = records[0].get('u').properties;
        
        // Nettoyage des données
        const cleanUser = {
            id: rawData.id,
            nom: rawData.nom,
            email: rawData.email,
            telephone: rawData.telephone,
            role: rawData.role || 'CLIENT',
            metier: rawData.metier || '',
        };

        console.log("Utilisateur connecté :", cleanUser.nom);

        // ✅ CORRECTION : On envoie à HomeApp, qui va distribuer aux onglets
        navigation.replace('HomeApp', { user: cleanUser }); 
      } else {
        navigation.replace('HomeApp', { user: { nom: 'Invité' } });
      }

    } catch (error) {
      console.error("Erreur Login:", error);
      Alert.alert("Échec de connexion", error.message);
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
            <TextInput style={styles.input} placeholder="ex: client@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput style={styles.input} placeholder="******" value={password} onChangeText={setPassword} secureTextEntry={true} />
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