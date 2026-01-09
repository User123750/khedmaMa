import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../../auth/AuthContext';
import { saveFreelancerProfile } from '../../../services/firestore';

export default function FreelancerRegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  function handleSignup() {
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir email et mot de passe');
      return;
    }
    if (password.length < 6) {
      setError('Mot de passe trop faible (≥ 6 caractères)');
      return;
    }
    setLoading(true);
    signUp({ name, email, password })
      .then(async (cred) => {
        const uid = cred.user?.uid;
        await saveFreelancerProfile(uid, { email, name });
      })
      .catch((e) => {
        const code = e?.code || '';
        if (code === 'auth/email-already-in-use') setError('Email déjà utilisé');
        else if (code === 'auth/invalid-email') setError('Email invalide');
        else if (code === 'auth/weak-password') setError('Mot de passe trop faible');
        else if (code === 'auth/operation-not-allowed') setError('Auth Email/Mot de passe non activée');
        else if (code === 'auth/network-request-failed') setError('Problème de réseau, réessayez');
        else setError('Informations invalides');
      })
      .finally(() => setLoading(false));
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Inscription Freelancer</Text>
          <Text style={styles.subtitle}>Rejoignez Khedma.ma en tant que pro</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Nom</Text>
          <TextInput style={styles.input} placeholder="ex: Pro Test" value={name} onChangeText={setName} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="ex: pro@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput style={styles.input} placeholder="******" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={[styles.signupButton, loading ? { opacity: 0.7 } : null]} onPress={handleSignup} disabled={loading}>
            <Text style={styles.signupButtonText}>{loading ? 'Création...' : 'Créer un compte'}</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity onPress={() => navigation.navigate('FreelancerLogin')}>
            <Text style={styles.linkText}>Déjà inscrit ? Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2196f3' },
  subtitle: { fontSize: 16, color: 'gray', marginTop: 8 },
  form: { width: '100%' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  signupButton: { backgroundColor: '#2196f3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 3 },
  signupButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkText: { textAlign: 'center', color: '#2196f3', marginTop: 10 },
  errorText: { textAlign: 'center', color: '#ff4444', marginTop: 10 }
});
