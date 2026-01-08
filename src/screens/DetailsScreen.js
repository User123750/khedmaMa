// src/screens/DetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

// Données fictives
const FAKE_PROS = [
  { id: 1, name: 'Ahmed B.', job: 'Plombier', rating: 4.8, latitude: 33.5731, longitude: -7.5898 },
  { id: 2, name: 'Karim S.', job: 'Plombier', rating: 4.5, latitude: 33.5800, longitude: -7.5900 },
  { id: 3, name: 'Socio Elec', job: 'Électricien', rating: 3.9, latitude: 33.5650, longitude: -7.6000 },
];

// CORRECTION 1 : Ajout de "navigation" ici (Indispensable !)
const DetailsScreen = ({ route, navigation }) => {
  
  const { serviceName } = route.params; 
  const prosToDisplay = FAKE_PROS.filter(p => p.job === serviceName || serviceName === 'Plombier');

  return (
    <View style={styles.container}>
      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 33.5731,
          longitude: -7.5898,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {prosToDisplay.map((pro) => (
          <Marker
            key={pro.id}
            coordinate={{ latitude: pro.latitude, longitude: pro.longitude }}
            title={pro.name}
            pinColor={serviceName === 'Plombier' ? 'blue' : 'red'}
          >
            {/* CORRECTION 2 : L'action onPress est SUR le Callout directement */}
            <Callout 
                tooltip
                onPress={() => navigation.navigate('ProProfile', { proData: pro })}
            >
                <View style={styles.calloutContainer}>
                    <View style={styles.calloutView}>
                        <Text style={styles.calloutTitle}>{pro.name}</Text>
                        <Text>{pro.job}</Text>
                        <Text style={styles.rating}>⭐ {pro.rating}</Text>
                        <Text style={styles.btnText}>Voir le profil &gt;</Text>
                    </View>
                </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Recherche : {serviceName}</Text>
        <Text style={styles.footerSub}>{prosToDisplay.length} professionnels trouvés</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  // Style important pour que la bulle soit blanche et jolie
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    width: 150,
    borderWidth: 1,
    borderColor: '#eee',
    // Petit hack pour l'ombre sur iOS/Android à l'intérieur de la map
    marginBottom: 5, 
  },
  calloutView: {
    alignItems: 'center',
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  rating: {
    color: '#f1c40f',
    marginTop: 2,
    fontWeight: 'bold',
  },
  btnText: {
    color: '#2196f3', // Bleu
    fontWeight: 'bold',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  footerSub: {
    color: 'gray',
  }
});

export default DetailsScreen;