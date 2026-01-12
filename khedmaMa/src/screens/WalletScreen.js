import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { runCypher } from '../services/neo4jService';

const WalletScreen = ({ route, navigation }) => {
  const currentUser = route.params?.currentUser; 

  const [stats, setStats] = useState({ available: 0, pending: 0, total: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous'); 

  const fetchWalletData = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {

      const queryStats = `
        MATCH (p:Prestataire {id: $proId})<-[r:RESERVE]-(c:Client)
        
        // On définit le montant dans une clause WITH
        WITH r, p, 
             CASE 
               WHEN r.prix IS NOT NULL THEN r.prix 
               ELSE p.tarifHoraire 
             END AS montant
        
        RETURN 
          sum(CASE WHEN r.status = 'TERMINE' THEN montant ELSE 0 END) as available,
          sum(CASE WHEN r.status = 'ACCEPTE' OR r.status = 'EN_COURS' THEN montant ELSE 0 END) as pending,
          sum(CASE WHEN r.status = 'TERMINE' THEN montant ELSE 0 END) as totalGagne
      `;

      const recordStats = await runCypher(queryStats, { proId: currentUser.id });
      
      if (recordStats.length > 0) {
        // Neo4j renvoie des objets Integer pour les sommes, on s'assure de convertir
        // (selon le driver, .toNumber() ou juste la valeur)
        const getVal = (val) => val ? (val.toNumber ? val.toNumber() : val) : 0;

        setStats({
          available: getVal(recordStats[0].get('available')),
          pending: getVal(recordStats[0].get('pending')),
          total: getVal(recordStats[0].get('totalGagne')),
        });
      }

      // 2. RÉCUPÉRATION DE L'HISTORIQUE
      const queryHistory = `
        MATCH (p:Prestataire {id: $proId})<-[r:RESERVE]-(c:Client)
        WHERE r.status IN ['TERMINE', 'ACCEPTE', 'EN_COURS']
        RETURN c.nom as client, r.datePrevue as date, r.status as status, 
               CASE WHEN r.prix IS NOT NULL THEN r.prix ELSE p.tarifHoraire END as amount, 
               id(r) as id
        ORDER BY r.dateCreation DESC
      `;
      
      const recordHistory = await runCypher(queryHistory, { proId: currentUser.id });
      
      const history = recordHistory.map(record => ({
        id: record.get('id').toString(),
        title: `Mission avec ${record.get('client')}`,
        date: record.get('date'),
        amount: record.get('amount') || 100, 
        status: record.get('status'),
        type: 'IN' 
      }));

      setTransactions(history);

    } catch (error) {
      console.error("Erreur Wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const renderTransaction = ({ item }) => {
    let statusColor = '#999';
    let icon = 'clock-outline';
    
    if (item.status === 'TERMINE') { statusColor = '#4CAF50'; icon = 'check-circle-outline'; }
    if (item.status === 'ACCEPTE' || item.status === 'EN_COURS') { statusColor = '#2196F3'; icon = 'progress-clock'; }

    return (
      <View style={styles.transCard}>
        <View style={[styles.iconBox, { backgroundColor: item.type === 'IN' ? '#e8f5e9' : '#ffebee' }]}>
           <MaterialCommunityIcons name="cash" size={24} color={item.type === 'IN' ? '#2e7d32' : '#c62828'} />
        </View>
        <View style={styles.transInfo}>
           <Text style={styles.transTitle}>{item.title}</Text>
           <View style={{flexDirection:'row', alignItems:'center'}}>
             <MaterialCommunityIcons name={icon} size={12} color={statusColor} />
             <Text style={[styles.transDate, {color: statusColor}]}> {item.status} • {item.date}</Text>
           </View>
        </View>
        <Text style={[styles.transAmount, { color: '#2e7d32' }]}>+{item.amount} DH</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Portefeuille</Text>
          <View style={styles.profileContainer}>
             <View style={styles.avatar}><MaterialCommunityIcons name="account" size={30} color="#2196f3" /></View>
             <Text style={styles.userName}>{currentUser?.nom || 'Prestataire'}</Text>
             <View style={styles.badge}><Text style={styles.badgeText}>Prestataire Certifié</Text></View>
          </View>
      </View>

      <View style={styles.balanceCard}>
         <View style={{flexDirection:'row', alignItems:'center'}}>
            <MaterialCommunityIcons name="wallet" size={24} color="#fff" />
            <Text style={styles.balanceLabel}> Solde disponible</Text>
         </View>
         <Text style={styles.balanceAmount}>{stats.available} DH</Text>

         <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
                <Text style={styles.balanceSubLabel}>Total Gagné</Text>
                <Text style={styles.balanceSubValue}>{stats.total} DH</Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.balanceItem}>
                <Text style={styles.balanceSubLabel}>En cours</Text>
                <Text style={styles.balanceSubValue}>{stats.pending} DH</Text>
            </View>
         </View>
      </View>

      <View style={styles.actionsContainer}>
         <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#FF9800'}]} onPress={() => Alert.alert("Retrait", "Fonctionnalité de virement bancaire à venir.")}>
             <MaterialCommunityIcons name="bank-transfer-out" size={28} color="#fff" />
             <Text style={styles.actionText}>Retirer</Text>
         </TouchableOpacity>

         <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#9C27B0'}]} onPress={() => Alert.alert("RIB", "Configuration du compte bancaire.")}>
             <MaterialCommunityIcons name="bank" size={28} color="#fff" />
             <Text style={styles.actionText}>Mon RIB</Text> 
         </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Historique des missions</Text>
        
        <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, filter === 'Tous' && styles.activeTab]} onPress={() => setFilter('Tous')}>
                <Text style={[styles.tabText, filter === 'Tous' && styles.activeTabText]}>Tous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, filter === 'Gains' && styles.activeTab]} onPress={() => setFilter('Gains')}>
                <Text style={[styles.tabText, filter === 'Gains' && styles.activeTabText]}>Gains</Text>
            </TouchableOpacity>
        </View>

        {loading ? (
            <ActivityIndicator color="#2196f3" style={{marginTop:20}} />
        ) : (
            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Text style={{ color: '#999' }}>Aucune transaction encore.</Text>
                    </View>
                }
            />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#2196f3', paddingTop: 40, paddingBottom: 80, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  profileContainer: { alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 5 },
  badgeText: { color: '#fff', fontSize: 12 },

  balanceCard: { backgroundColor: '#43a047', marginHorizontal: 20, borderRadius: 20, padding: 20, marginTop: -60, elevation: 5 },
  balanceLabel: { color: '#fff', fontSize: 16, marginLeft: 5 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  balanceRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 15, marginTop: 10 },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceSubLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  balanceSubValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  verticalLine: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  actionBtn: { flex: 0.48, padding: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  actionText: { color: '#fff', fontWeight: 'bold', marginTop: 5 },

  historyContainer: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  tabs: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#e0e0e0', borderRadius: 10, padding: 2 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#fff', elevation: 2 },
  tabText: { color: '#777', fontWeight: '600' },
  activeTabText: { color: '#333', fontWeight: 'bold' },

  transCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor:'#fff', paddingHorizontal:10, borderRadius:10, marginBottom:10 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  transInfo: { flex: 1 },
  transTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  transDate: { fontSize: 12, marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: 'bold' }
});

export default WalletScreen;