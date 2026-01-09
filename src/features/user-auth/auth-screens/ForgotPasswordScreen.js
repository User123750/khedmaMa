import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../../auth/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleReset() {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Veuillez saisir votre email');
      return;
    }
    setLoading(true);
    resetPassword(email)
      .then(() => setSuccess('Email de réinitialisation envoyé'))
      .catch((e) => {
        const code = e?.code || '';
        if (code === 'auth/user-not-found') setError('Aucun compte avec cet email');
        else if (code === 'auth/invalid-email') setError('Email invalide');
        else setError('Échec de l’envoi, réessayez');
      })
      .finally(() => setLoading(false));
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>Entrez votre email pour recevoir un lien</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: client@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={[styles.actionButton, loading ? { opacity: 0.7 } : null]} onPress={handleReset} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? 'Envoi...' : 'Envoyer le lien'}</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Retour à la connexion</Text>
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
  actionButton: { backgroundColor: '#2196f3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 3 },
  actionButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkText: { textAlign: 'center', color: '#2196f3', marginTop: 10 },
  errorText: { textAlign: 'center', color: '#ff4444', marginTop: 10 },
  successText: { textAlign: 'center', color: '#2e7d32', marginTop: 10 }
});
