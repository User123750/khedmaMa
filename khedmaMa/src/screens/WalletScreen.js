import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  ScrollView, RefreshControl, Animated, Alert, ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { runCypher } from '../services/neo4jService';

const WalletScreen = ({ route }) => {
  const navigation = useNavigation();
  
  // Dans App.js ProTabs, on passe 'currentUser'
  const user = route.params?.currentUser || route.params?.user || { nom: 'Prestataire' };
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États dynamiques
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [totalGains, setTotalGains] = useState(0);
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Animation et Chargement
  useFocusEffect(
    useCallback(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
        
        fetchWalletData();
    }, [])
  );

  // --- RÉCUPÉRATION DES DONNÉES NEO4J ---
  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    try {
        // On cherche les missions réalisées par ce prestataire
        // On récupère aussi le client qui a fait la demande
        const query = `
           MATCH (p:Utilisateur {id: $uid})-[:REALISE]->(m:Mission)<-[:DEMANDE]-(c:Utilisateur)
           RETURN m, c
           ORDER BY m.dateHeure DESC
        `;
        const records = await runCypher(query, { uid: user.id });

        let currentBalance = 0;
        let currentPending = 0;
        let allTimeGains = 0;
        const loadedTransactions = [];

        records.forEach((record, index) => {
            const m = record.get('m').properties;
            const c = record.get('c').properties;
            
            // Logique des statuts
            let statutDisplay = 'En attente';
            let type = 'pending';
            let color = '#FF9800'; // Orange
            const prix = m.prixTotal || 0;

            if (m.statut === 'TERMINE' || m.statut === 'PAYE') {
                statutDisplay = 'Payé';
                type = 'credit';
                color = '#4CAF50'; // Vert
                currentBalance += prix;
                allTimeGains += prix;
            } else if (m.statut === 'EN_COURS' || m.statut === 'EN_ATTENTE') {
                statutDisplay = 'En cours';
                type = 'pending';
                color = '#FF9800';
                currentPending += prix;
            } else if (m.statut === 'REFUSE' || m.statut === 'ANNULE') {
                statutDisplay = 'Annulé';
                type = 'failed';
                color = '#F44336'; // Rouge
            }

            // Icône selon le métier (simple détection par mot clé dans la description)
            // Tu pourrais aussi stocker l'icône dans la mission
            let icon = 'briefcase-account';
            const desc = (m.description || '').toLowerCase();
            if(desc.includes('eau') || desc.includes('fuite')) icon = 'water-pump';
            else if(desc.includes('elec') || desc.includes('lumi')) icon = 'flash';
            else if(desc.includes('peint')) icon = 'format-paint';
            else if(desc.includes('jardin')) icon = 'flower';

            loadedTransactions.push({
                id: m.id || index.toString(),
                service: m.description || 'Service',
                client: c.nom || 'Client',
                montant: prix,
                date: m.dateHeure ? new Date(m.dateHeure).toLocaleDateString('fr-FR') : 'Date inconnue',
                statut: statutDisplay,
                type: type,
                icon: icon,
                color: color
            });
        });

        setTransactions(loadedTransactions);
        setBalance(currentBalance);
        setPendingBalance(currentPending);
        setTotalGains(allTimeGains);

    } catch (error) {
        console.error("Erreur Wallet:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
  };

  const handleWithdrawal = () => {
    if (balance < 100) {
      Alert.alert('Solde insuffisant', 'Le minimum de retrait est de 100 DH');
      return;
    }
    Alert.alert(
      'Demander un retrait',
      `Retirer ${balance} DH vers votre compte bancaire ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            Alert.alert('Succès', 'Virement en cours (Simulation).');
            // Ici, tu pourrais ajouter un nœud :Paiement dans Neo4j
            setBalance(0);
          }
        }
      ]
    );
  };

  // Filtrage
  const filteredTransactions = transactions.filter(t => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'credits') return t.type === 'credit';
    if (selectedFilter === 'pending') return t.type === 'pending';
    return true;
  });

  const renderTransaction = ({ item }) => (
    <Animated.View style={[styles.transactionCard, { opacity: fadeAnim }]}>
      <View style={styles.transactionLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
          <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
        </View>
        <View style={styles.details}>
          <Text style={styles.serviceText} numberOfLines={1}>{item.service}</Text>
          <View style={styles.detailsRow}>
            <MaterialCommunityIcons name="account" size={12} color="#666" />
            <Text style={styles.clientText}> {item.client}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: item.type === 'credit' ? '#E8F5E9' : item.type === 'failed' ? '#FFEBEE' : '#FFF3E0' }]}>
              <Text style={[styles.statusText, { color: item.color }]}>{item.statut}</Text>
            </View>
            <Text style={styles.dateText}>• {item.date}</Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.amountText, { color: item.color }]}>
          {item.type === 'credit' ? '+' : ''}{item.montant} DH
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />}
      >
        {/* Header */}
        <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mon Portefeuille</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.addButton}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <FontAwesome5 name="user-tie" size={24} color="#2196F3" />
            </View>
            <Text style={styles.userName}>{user.nom}</Text>
            <Text style={styles.userRole}>Prestataire Certifié</Text>
          </View>
        </LinearGradient>

        {/* Balance Card */}
        <View style={styles.balanceCardWrapper}>
          <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.balanceCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.balanceHeader}>
              <MaterialCommunityIcons name="wallet" size={28} color="#fff" />
              <Text style={styles.balanceLabel}>Solde disponible</Text>
            </View>
            <Text style={styles.balanceValue}>{balance.toLocaleString()} DH</Text>
            
            <View style={styles.balanceStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Gagné</Text>
                <Text style={styles.statValue}>{totalGains.toLocaleString()} DH</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>En cours</Text>
                <Text style={styles.statValue}>{pendingBalance} DH</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleWithdrawal}>
            <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.actionButtonInner}>
              <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#fff" />
              <Text style={styles.actionText}>Retirer</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Info', 'Scanner QR Code Client')}>
            <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.actionButtonInner}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
              <Text style={styles.actionText}>Recevoir</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Historique</Text>
          <View style={styles.filters}>
            {['all', 'credits', 'pending'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                  {filter === 'all' ? 'Tous' : filter === 'credits' ? 'Gains' : 'En cours'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          {loading ? (
             <ActivityIndicator size="large" color="#2196f3" style={{marginTop: 20}} />
          ) : filteredTransactions.length > 0 ? (
            <FlatList
              data={filteredTransactions}
              keyExtractor={item => item.id}
              renderItem={renderTransaction}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="wallet-outline" size={80} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>Aucune transaction</Text>
              <Text style={styles.emptyText}>Vos missions terminées apparaîtront ici.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  backButton: { padding: 8 },
  addButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  userInfo: { alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 5 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 4 },
  userRole: { color: 'rgba(255,255,255,0.8)', fontSize: 14, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  balanceCardWrapper: { paddingHorizontal: 20, marginTop: -30, marginBottom: 20 },
  balanceCard: { borderRadius: 25, padding: 25, elevation: 10 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  balanceLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginLeft: 10, fontWeight: '500' },
  balanceValue: { color: '#fff', fontSize: 42, fontWeight: '700', marginBottom: 20 },
  balanceStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16 },
  statItem: { alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 6 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  quickActions: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingHorizontal: 20, marginBottom: 25 },
  actionButton: { width: '45%', borderRadius: 20, elevation: 5 },
  actionButtonInner: { paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 8 },
  filterSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2C3E50', marginBottom: 15 },
  filters: { flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 12, padding: 5 },
  filterButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  filterButtonActive: { backgroundColor: '#fff', elevation: 3 },
  filterText: { fontSize: 14, color: '#718096', fontWeight: '500' },
  filterTextActive: { color: '#2196F3', fontWeight: '600' },
  transactionsSection: { flex: 1, minHeight: 400 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 18, borderRadius: 18, marginBottom: 15, elevation: 3 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  details: { flex: 1 },
  serviceText: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 6 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  clientText: { fontSize: 12, color: '#718096' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: '600' },
  dateText: { fontSize: 11, color: '#999' },
  transactionRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 18, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#A0AEC0', marginTop: 20, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#CBD5E0', textAlign: 'center' },
});

export default WalletScreen;