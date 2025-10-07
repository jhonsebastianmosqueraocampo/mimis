import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function ProfileCard() {

  return (
    <Card style={styles.card} elevation={2}>
      <View style={styles.content}>
        {/* Logo del equipo */}
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
            }}
            style={styles.logo}
          />
        </View>

        {/* Info del usuario */}
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>Jhon Sebastian Mosquera</Text>

          <View style={styles.pointsContainer}>
            <MaterialCommunityIcons
              name="trophy"
              size={20}
              color="#1DB954"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.pointsText}>
              <Text style={styles.pointsNumber}>900</Text> puntos sumados
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
    height: 130,
    justifyContent: 'center',
    width: '80%',
    alignSelf: 'center'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    marginRight: 12,
    elevation: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  username: {
    fontSize: 16,
    fontFamily: 'sans-serif',
    color: '#222',
    marginBottom: 6,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pointsText: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '700',
  },
  pointsNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
});