// src/screens/NotificationsScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#2196f3',
  background: '#f8f9fa',
  white: '#fff',
  text: '#333',
  gray: '#777',
  lightGray: '#e0e0e0',
};

// Données fictives
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    title: 'Commande confirmée',
    message: 'Votre plombier Karim S. arrivera demain à 14h00.',
    time: 'Il y a 2 min',
    read: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Promotion Spéciale',
    message: '-20% sur tous les services de jardinage ce week-end !',
    time: 'Il y a 2 heures',
    read: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'Mise à jour',
    message: 'Vos informations de paiement ont été mises à jour avec succès.',
    time: 'Hier',
    read: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

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
    // Ombres légères
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