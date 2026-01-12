import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, Image
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; 

const SERVICES = [
  { id: '1', title: 'Plombier', icon: 'pipe-wrench', color: '#e3f2fd', iconColor: '#2196f3' },
  { id: '2', title: 'Électricien', icon: 'lightning-bolt', color: '#fff3e0', iconColor: '#ff9800' },
  { id: '3', title: 'Ménage', icon: 'broom', color: '#e8f5e9', iconColor: '#4caf50' },
  { id: '4', title: 'Peintre', icon: 'format-paint', color: '#f3e5f5', iconColor: '#9c27b0' },
  { id: '5', title: 'Jardinage', icon: 'flower', color: '#fbe9e7', iconColor: '#ff5722' },
  { id: '6', title: 'Déménageur', icon: 'truck-delivery', color: '#eceff1', iconColor: '#607d8b' },
];

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25; 

const HomeScreen = ({ navigation, route }) => {
  const user = route.params?.user || { nom: 'Invité', id: 'unknown' };
  const [recommendations, setRecommendations] = useState([]);
  
  useFocusEffect(
    useCallback(() => {
      if(user.id === 'unknown') return;

      let isActive = true;
      const fetchRecommendations = async () => {
        try {
            const timestamp = new Date().getTime();
            //  Vérifie bien ton IP ici
            const API_URL = `http://10.181.182.244:3000/api/recommendations/${user.id}?t=${timestamp}`;
            
            const response = await fetch(API_URL);
            const data = await response.json();
            
            if (isActive) {
                setRecommendations(data);
            }
        } catch (error) {
            console.log("Erreur chargement recommandations:", error);
        }
      };

      fetchRecommendations();

      return () => { isActive = false; };
    }, [user.id])
  );

  const HeaderWithRecommendations = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {user.nom} 👋</Text>
        <Text style={styles.subtitle}>De quel service avez-vous besoin ?</Text>
      </View>

      {/* Section Recommandations */}
      {recommendations.length > 0 && (
        <View style={styles.recSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Les plus populaires 🔥</Text>
            </View>
            
            <FlatList 
                horizontal
                data={recommendations}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.recCard}
                        onPress={() => navigation.navigate('Details', { serviceName: item.metier, currentUser: user })}
                    >
                         {/* Avatar centré en haut */}
                         <View style={styles.avatarContainer}>
                            <Image 
                                source={
                                item.photo 
                                    ? { uri: item.photo } 
                                    : { uri: `https://ui-avatars.com/api/?name=${item.nom}&background=random&color=fff&bold=true` }
                                }
                                style={styles.avatar} 
                            />
                         </View>

                         {/* Badge de popularité */}
                         <View style={styles.popularityBadge}>
                             <Ionicons name="star" size={10} color="#f59e0b" />
                             <Text style={styles.popularityText}>
                                {item.score > 0 ? `${item.score}` : "0"}
                             </Text>
                         </View>

                         {/* Infos */}
                         <View style={styles.recContent}>
                            <Text style={styles.recName} numberOfLines={1}>{item.nom}</Text>
                            <Text style={styles.recJob}>{item.metier}</Text>
                         </View>

                         <Text style={styles.recCta}>Voir profil</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
      )}
      
      <Text style={[styles.sectionTitle, { marginLeft: 20, marginBottom: 15 }]}>Catégories</Text>
    </View>
  );

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate('Details', { serviceName: item.title, currentUser: user })}
    >
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.iconColor} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        ListHeaderComponent={HeaderWithRecommendations}
        data={SERVICES}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id}
        numColumns={2} 
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },
  header: { paddingHorizontal: 20, marginBottom: 20, marginTop: 40 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  
  recSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginRight: 5 },
  
  recCard: { 
      backgroundColor: '#2c3e50', 
      width: 150, 
      height: 140, 
      borderRadius: 16, 
      padding: 12, 
      marginRight: 15, 
      alignItems: 'center', 
      justifyContent: 'space-between',
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, 
      elevation: 8,
      paddingTop: 30 
  },
  avatarContainer: {
      position: 'absolute',
      top: -15, 
      alignSelf: 'center', 
      backgroundColor: '#fff',
      padding: 2,
      borderRadius: 25,
      zIndex: 10
  },
  avatar: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
  },
  popularityBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#fffbeb', 
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#fcd34d'
  },
  popularityText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#b45309',
      marginLeft: 2
  },
  recContent: {
      marginTop: 10, 
      alignItems: 'center'
  },
  recName: { 
      color: '#fff', 
      fontWeight: 'bold', 
      fontSize: 15, 
      textAlign: 'center'
  },
  recJob: { 
      color: '#94a3b8', 
      fontSize: 12,
      textTransform: 'uppercase',
      marginTop: 2
  },
  recCta: { 
      color: '#4ade80', 
      fontWeight: '600', 
      fontSize: 12,
      marginBottom: 5
  },

  listContainer: { paddingBottom: 20 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 15 },
  card: { 
      width: COLUMN_WIDTH, 
      height: 140, 
      borderRadius: 24, 
      padding: 15, 
      marginBottom: 15, 
      justifyContent: 'center', 
      alignItems: 'center', 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.05, 
      shadowRadius: 3.84, 
      elevation: 2,
  },
  iconContainer: { 
      width: 60, 
      height: 60, 
      borderRadius: 30, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginBottom: 12,
  },
  cardTitle: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#334155' 
  },
});

export default HomeScreen;