// src/screens/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { runCypher } from '../services/neo4jService';

const COLORS = {
  primary: '#2196f3',
  background: '#f8f9fa',
  white: '#fff',
  text: '#333',
  gray: '#777',
};

export default function NotificationsScreen({ route }) {
  // On récupère l'utilisateur passé depuis SettingsScreen
  const user = route.params?.user;
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RÉCUPÉRATION DES NOTIFS DEPUIS NEO4J ---
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
          setLoading(false);
          return;
      }

      try {
        // On cherche les notifications liées à l'utilisateur
        // La relation est : (Notification)-[:DESTINE_A]->(Utilisateur)
        const query = `
          MATCH (n:Notification)-[:DESTINE_A]->(u:Utilisateur {id: $uid})
          RETURN n
          ORDER BY n.dateCreation DESC
        `;
        const params = { uid: user.id };
        
        const records = await runCypher(query, params);
        
        // On formate les données
        const notifs = records.map(record => {
            const props = record.get('n').properties;
            return {
                id: props.id || Math.random().toString(),
                type: props.type || 'system',
                title: props.titre || 'Notification',
                message: props.message || '',
                time: props.dateString || 'Récemment', // On simplifie la date pour l'instant
                read: props.lu || false
            };
        });

        setNotifications(notifs);
      } catch (error) {
        console.error("Erreur notifs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return { name: 'calendar-check', color: '#4CAF50' }; // Vert
      case 'promo': return { name: 'tag', color: '#FF9800' }; // Orange
      case 'system': return { name: 'information', color: '#2196f3' }; // Bleu
      default: return { name: 'bell', color: '#777' };
    }
  };

  const renderItem = ({ item }) => {
    const iconData = getIcon(item.type);
    
    return (
      <View style={[styles.item, !item.read && styles.unreadItem]}>
        <View style={[styles.iconBox, { backgroundColor: iconData.color + '20' }]}>
          <MaterialCommunityIcons name={iconData.name} size={24} color={iconData.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <MaterialCommunityIcons name="bell-sleep" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Aucune notification pour le moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 15 },
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconBox: {
    width: 45, height: 45, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },
  time: { fontSize: 12, color: COLORS.gray },
  message: { fontSize: 14, color: '#555', lineHeight: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 10 },
  emptyCenter: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.gray, marginTop: 10, fontSize: 16 },
});