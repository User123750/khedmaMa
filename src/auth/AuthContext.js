import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Écouter les changements d'état d'authentification (connexion, déconnexion, auto-login)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signOut() {
    return firebaseSignOut(auth);
  }

  async function signUp(payload) {
    const { email, password, name } = payload;
    // Créer l'utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Mettre à jour le profil (nom)
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
      // Forcer la mise à jour de l'état local car updateProfile ne déclenche pas toujours onAuthStateChanged immédiatement avec le nouveau nom
      setUser({ ...userCredential.user, displayName: name });
    }
    return userCredential;
  }
  
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  const value = useMemo(() => ({ 
    user, 
    signIn, 
    signOut, 
    signUp,
    resetPassword,
    loading 
  }), [user, loading]);

  if (loading) {
    // Tu peux retourner null ou un spinner ici si tu veux bloquer l'affichage tant que l'auth n'est pas chargée
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
