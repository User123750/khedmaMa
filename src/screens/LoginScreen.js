// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator 
} from 'react-native';

// Importation des fonctions Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; 

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
      // Connexion via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Connecté avec succès, UID:", user.uid);
      
      // Redirection vers l'accueil
      navigation.replace('HomeApp'); 

    } catch (error) {
      console.error(error);
      let errorMessage = "Une erreur est survenue.";
      // Traduction des erreurs Firebase courantes
      if (error.code === 'auth/invalid-email') errorMessage = "Format d'email invalide.";
      if (error.code === 'auth/user-not-found') errorMessage = "Utilisateur introuvable.";
      if (error.code === 'auth/wrong-password') errorMessage = "Mot de passe incorrect.";
      if (error.code === 'auth/invalid-credential') errorMessage = "Identifiants incorrects.";
      if (error.code === 'auth/too-many-requests') errorMessage = "Trop de tentatives. Réessayez plus tard.";
      
      Alert.alert("Échec de connexion", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MODIFICATION ICI : Navigation active vers l'écran d'inscription
  const goToSignUp = () => {
      navigation.navigate('SignUpScreen'); 
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
            <Text style={styles.logoText}>Khedma.ma 🇲🇦</Text>
            <Text style={styles.subtitle}>Votre expert à domicile</Text>
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

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
                style={styles.input}
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true} 
            />

            <TouchableOpacity 
                style={[styles.loginButton, loading && {opacity: 0.7}]} 
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={goToSignUp}>
                <Text style={styles.linkText}>Pas encore de compte ? Créer un compte</Text>
            </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#2196f3',
    marginTop: 10,
  }
});

export default LoginScreen;