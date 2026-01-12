import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, 
  ScrollView, Alert, ActivityIndicator, SafeAreaView, Image, 
  Modal, Dimensions, Animated, Platform 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { runCypher } from '../services/neo4jService';
import { auth } from '../config/firebase';
import { deleteUser } from 'firebase/auth';

const { width } = Dimensions.get('window');

const ProProfileScreen = ({ route, navigation }) => {
  // On récupère l'utilisateur initial, mais on va rafraîchir les données via la DB
  const { currentUser: initialUser } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // États du formulaire
  const [formData, setFormData] = useState({
    cin: '',
    metier: '',
    tarif: '',
    description: '',
    experience: '',
    telephone: '',
    ville: 'Casablanca'
  });
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [specialites, setSpecialites] = useState([]);
  
  // États des statistiques dynamiques
  const [stats, setStats] = useState({
    missionsCompletees: 0,
    clientsSatisfaits: 0,
    noteMoyenne: 0.0,
    revenuTotal: 0
  });

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  //  CHARGEMENT DES DONNÉES DEPUIS NEO4J
  const fetchProfileData = async () => {
    try {
      // Requête pour récupérer les infos PRO + Calculer les stats en même temps
      const query = `
        MATCH (p:Utilisateur:Prestataire {id: $id})
        
        // Calcul optionnel des statistiques (Missions terminées)
        OPTIONAL MATCH (p)-[:REALISE]->(m:Mission) WHERE m.statut = 'TERMINE'
        OPTIONAL MATCH (m)<-[:CONCERNE]-(a:Avis)
        
        RETURN p, 
               count(m) as missionsCount, 
               avg(a.note) as avgNote, 
               sum(m.prixTotal) as totalRevenu,
               count(DISTINCT m.clientId) as clientCount
      `;

      const records = await runCypher(query, { id: initialUser.id });

      if (records.length > 0) {
        const record = records[0];
        const p = record.get('p').properties;
        const missionsCount = record.get('missionsCount').toNumber();
        const avgNote = record.get('avgNote') !== null ? record.get('avgNote') : 0.0;
        const totalRevenu = record.get('totalRevenu') !== null ? record.get('totalRevenu') : 0;
        const clientCount = record.get('clientCount').toNumber();

        // Mise à jour du formulaire avec les vraies données
        setFormData({
          cin: p.cin || '',
          metier: p.metier || '',
          tarif: p.tarifHoraire ? p.tarifHoraire.toString() : '',
          description: p.description || '',
          experience: p.experience ? p.experience.toString() : '',
          telephone: p.telephone || '',
          ville: p.ville || 'Casablanca'
        });

        setIsAvailable(p.estDisponible || false);
        setSpecialites(p.specialites || []);
        if (p.photo) setImage(p.photo);

        // Mise à jour des stats
        setStats({
          missionsCompletees: missionsCount,
          clientsSatisfaits: clientCount,
          noteMoyenne: parseFloat(avgNote.toFixed(1)),
          revenuTotal: totalRevenu
        });
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  // On recharge les données à chaque fois que l'écran gagne le focus
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  // Fonction image (Locale pour l'instant)
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Besoin accès photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Qualité réduite pour éviter crash mémoire
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialite = () => {
    Alert.prompt('Nouvelle spécialité', 'Ajoutez une compétence', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Ajouter', onPress: (text) => {
          if (text && text.trim()) setSpecialites([...specialites, text.trim()]);
      }}
    ]);
  };

  const removeSpecialite = (index) => {
    const newSpec = [...specialites];
    newSpec.splice(index, 1);
    setSpecialites(newSpec);
  };

  //  MISE À JOUR DU PROFIL (UPDATE)
  const handleUpdateProfile = async () => {
    // Validation basique
    if (!formData.metier || !formData.tarif || !formData.telephone) {
      Alert.alert('Erreur', 'Métier, Tarif et Téléphone sont obligatoires.');
      return;
    }

    setSaving(true);
    try {
      const tarifNum = parseFloat(formData.tarif);
      const expNum = parseInt(formData.experience) || 0;

      const query = `
        MATCH (p:Utilisateur:Prestataire {id: $id})
        SET p.cin = $cin,
            p.metier = $metier,
            p.tarifHoraire = $tarif,
            p.description = $description,
            p.experience = $experience,
            p.telephone = $telephone,
            p.ville = $ville,
            p.specialites = $specialites,
            p.estDisponible = $estDisponible,
            p.photo = $photo
        RETURN p
      `;

      const params = {
        id: initialUser.id,
        cin: formData.cin,
        metier: formData.metier,
        tarif: tarifNum,
        description: formData.description,
        experience: expNum,
        telephone: formData.telephone,
        ville: formData.ville,
        specialites: specialites,
        estDisponible: isAvailable,
        photo: image || '' 
      };

      await runCypher(query, params);

      Alert.alert('Succès', 'Profil mis à jour !');
      // On peut aussi mettre à jour le context navigation si besoin
    } catch (error) {
      console.error('Erreur Update:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour.');
    } finally {
      setSaving(false);
    }
  };

  //  SUPPRESSION DU COMPTE (DELETE)
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const uid = initialUser.id;

      // 1. Supprimer de Neo4j (Détachement des relations d'abord)
      const query = `MATCH (u:Utilisateur {id: $id}) DETACH DELETE u`;
      await runCypher(query, { id: uid });

      // 2. Supprimer de Firebase Auth
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
      }

      Alert.alert('Adieu', 'Votre compte a été supprimé.');
      navigation.replace('LoginScreen'); // Retour Login

    } catch (error) {
      console.error("Erreur suppression:", error);
      Alert.alert('Erreur', 'Impossible de supprimer le compte. Reconnectez-vous et réessayez.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteAccount = () => setShowDeleteConfirm(true);

  // --- RENDU STATS MODAL ---
  const StatsModal = () => (
    <Modal animationType="slide" transparent={true} visible={showStatsModal} onRequestClose={() => setShowStatsModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mes Statistiques</Text>
            <TouchableOpacity onPress={() => setShowStatsModal(false)}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.missionsCompletees}</Text>
              <Text style={styles.statLabel}>Missions</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="star" size={32} color="#FFC107" />
              <Text style={styles.statNumber}>{stats.noteMoyenne}/5</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-group" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>{stats.clientsSatisfaits}</Text>
              <Text style={styles.statLabel}>Clients</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="cash" size={32} color="#8BC34A" />
              <Text style={styles.statNumber}>{stats.revenuTotal.toLocaleString()} DH</Text>
              <Text style={styles.statLabel}>Revenus</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mon Profil Pro</Text>
            <TouchableOpacity onPress={() => setShowStatsModal(true)} style={styles.statsButton}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={() => {
              Alert.alert('Changer photo', 'Choisir une option', [
                { text: 'Caméra', onPress: takePhoto },
                { text: 'Galerie', onPress: pickImage },
                { text: 'Annuler', style: 'cancel' }
              ]);
            }}>
              <View style={styles.avatarContainer}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <FontAwesome5 name="user-tie" size={40} color="#2196F3" />
                  </View>
                )}
                <View style={styles.editAvatarButton}>
                  <Feather name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{formData.cin || initialUser.nom}</Text>
              <Text style={styles.userEmail}>{initialUser.email}</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFC107" />
                <Text style={styles.ratingText}>{stats.noteMoyenne} ({stats.missionsCompletees} missions)</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Switch Disponibilité */}
        <Animated.View style={[styles.availabilityCard, { opacity: fadeAnim }]}>
          <View style={styles.availabilityHeader}>
            <MaterialCommunityIcons 
              name={isAvailable ? "toggle-switch" : "toggle-switch-off"} 
              size={28} 
              color={isAvailable ? "#4CAF50" : "#F44336"} 
            />
            <View style={styles.availabilityTexts}>
              <Text style={styles.availabilityTitle}>{isAvailable ? 'Disponible' : 'Indisponible'}</Text>
              <Text style={styles.availabilitySubtitle}>
                {isAvailable ? 'Visible par les clients' : 'Masqué de la recherche'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
              thumbColor={isAvailable ? "#4CAF50" : "#F5F5F5"}
            />
          </View>
        </Animated.View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Infos Professionnelles</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>CIN</Text>
            <TextInput style={styles.input} value={formData.cin} onChangeText={t => handleInputChange('cin', t)} placeholder="AB123456" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Métier</Text>
            <TextInput style={styles.input} value={formData.metier} onChangeText={t => handleInputChange('metier', t)} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tarif (DH/h)</Text>
            <TextInput style={styles.input} value={formData.tarif} onChangeText={t => handleInputChange('tarif', t)} keyboardType="numeric" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput style={styles.input} value={formData.telephone} onChangeText={t => handleInputChange('telephone', t)} keyboardType="phone-pad" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ville</Text>
            <View style={styles.citySelector}>
              {['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'].map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityButton, formData.ville === city && styles.cityButtonActive]}
                  onPress={() => handleInputChange('ville', city)}
                >
                  <Text style={[styles.cityButtonText, formData.ville === city && styles.cityButtonTextActive]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={t => handleInputChange('description', t)} multiline numberOfLines={4} textAlignVertical="top" placeholder="Décrivez vos services..." />
          </View>

          {/* Spécialités */}
          <View style={styles.formGroup}>
            <View style={styles.specialitesHeader}>
              <Text style={styles.label}>Spécialités</Text>
              <TouchableOpacity onPress={addSpecialite} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>
            <View style={styles.specialitesContainer}>
              {specialites.map((spec, index) => (
                <View key={index} style={styles.specialiteTag}>
                  <Text style={styles.specialiteText}>{spec}</Text>
                  <TouchableOpacity onPress={() => removeSpecialite(index)}>
                    <Ionicons name="close" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
              {specialites.length === 0 && <Text style={styles.emptySpecialites}>Aucune spécialité ajoutée</Text>}
            </View>
          </View>

          {/* Boutons Actions */}
          <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleUpdateProfile} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={() => { auth.signOut(); navigation.replace('LoginScreen'); }}>
            <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={loading}>
            <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
            <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Confirmation Suppression */}
      <Modal animationType="fade" transparent={true} visible={showDeleteConfirm} onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <MaterialCommunityIcons name="alert-circle" size={60} color="#F44336" />
            <Text style={styles.confirmModalTitle}>Supprimer le compte ?</Text>
            <Text style={styles.confirmModalText}>Cette action est irréversible. Toutes vos données seront effacées.</Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteButton} onPress={confirmDelete}>
                <Text style={styles.confirmDeleteButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <StatsModal />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 8 },
  statsButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 20 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2196F3', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  profileInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  userEmail: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  ratingText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  availabilityCard: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: -20, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  availabilityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availabilityTexts: { flex: 1, marginLeft: 15 },
  availabilityTitle: { fontSize: 18, fontWeight: '700', color: '#2C3E50', marginBottom: 4 },
  availabilitySubtitle: { fontSize: 13, color: '#7F8C8D' },
  formContainer: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2C3E50', marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#34495E', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#2C3E50' },
  textArea: { minHeight: 100, paddingTop: 16 },
  citySelector: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  cityButton: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#EDF2F7', borderRadius: 20, marginHorizontal: 4, marginVertical: 4 },
  cityButtonActive: { backgroundColor: '#2196F3' },
  cityButtonText: { fontSize: 14, color: '#4A5568', fontWeight: '500' },
  cityButtonTextActive: { color: '#fff', fontWeight: '600' },
  specialitesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addButton: { padding: 4 },
  specialitesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  specialiteTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F4FD', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  specialiteText: { fontSize: 14, color: '#2196F3', fontWeight: '500', marginRight: 8 },
  emptySpecialites: { color: '#A0AEC0', fontSize: 14, fontStyle: 'italic' },
  saveButton: { backgroundColor: '#2196F3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 14, marginTop: 10, marginBottom: 15, shadowColor: '#2196F3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: '#F44336', marginBottom: 12 },
  logoutButtonText: { color: '#F44336', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  deleteButtonText: { color: '#F44336', fontSize: 16, fontWeight: '500', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#2C3E50' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 15 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#2C3E50', marginVertical: 8 },
  statLabel: { fontSize: 14, color: '#718096', fontWeight: '500' },
  confirmModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmModalContent: { backgroundColor: '#fff', borderRadius: 25, padding: 30, width: '100%', maxWidth: 400, alignItems: 'center' },
  confirmModalTitle: { fontSize: 22, fontWeight: '700', color: '#2C3E50', marginTop: 20, marginBottom: 15 },
  confirmModalText: { fontSize: 16, color: '#718096', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  confirmModalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelButton: { flex: 1, paddingVertical: 16, backgroundColor: '#EDF2F7', borderRadius: 14, alignItems: 'center', marginRight: 10 },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#4A5568' },
  confirmDeleteButton: { flex: 1, paddingVertical: 16, backgroundColor: '#F44336', borderRadius: 14, alignItems: 'center', marginLeft: 10 },
  confirmDeleteButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});

export default ProProfileScreen;