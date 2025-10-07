import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Avatar, Surface } from 'react-native-paper';

type BallData = {
  x: number;
  y: number;
  playerWithBall?: string;
  time: string;
  description: string;
  score: string;
};

const fakeStream: BallData[] = [
  {
    time: '12:01',
    x: 0.5,
    y: 0.3,
    playerWithBall: 'Lewandowski',
    description: 'Driblea por banda derecha',
    score: '1 - 0',
  },
  {
    time: '12:05',
    x: 0.52,
    y: 0.35,
    playerWithBall: 'Lewandowski',
    description: 'Pase corto a Pedri',
    score: '1 - 0',
  },
  {
    time: '12:10',
    x: 0.6,
    y: 0.4,
    playerWithBall: 'Pedri',
    description: 'Centro al área',
    score: '1 - 0',
  },
];

export default function RealTimeBallTracker() {
  const [current, setCurrent] = useState<BallData>(fakeStream[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = Math.min(index + 1, fakeStream.length - 1);
      setCurrent(fakeStream[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pitchWidth = Dimensions.get('window').width - 40; // with margin
  const pitchHeight = (pitchWidth * 9) / 16;

  const ballStyle = {
    top: current.y * pitchHeight - 12,
    left: current.x * pitchWidth - 12,
  };

  const labelStyle = {
    top: current.y * pitchHeight - 28,
    left: current.x * pitchWidth - 28,
  };

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>🔵 Seguimiento en tiempo real</Text>

      {/* Campo de juego */}
      <View style={[styles.pitchContainer, { height: pitchHeight }]}>
        <ImageBackground
          source={require('../assets/pitch.svg')} // Debes tener esta imagen en assets
          resizeMode="contain"
          style={styles.pitchImage}
        >
          {/* Balón */}
          <View style={[styles.ball, ballStyle]}>
            <Avatar.Text size={24} label="⚽" style={styles.ballAvatar} />
          </View>

          {/* Jugador con el balón */}
          {current.playerWithBall && (
            <View style={[styles.playerLabel, labelStyle]}>
              <Text style={styles.playerText}>{current.playerWithBall}</Text>
            </View>
          )}
        </ImageBackground>
      </View>

      {/* Detalles del evento */}
      <View style={styles.details}>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Tiempo:</Text> {current.time}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Marcador:</Text> {current.score}
        </Text>
        <Text style={styles.description}>
          <Text style={styles.italic}>{current.description}</Text>
        </Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pitchContainer: {
    width: '100%',
    backgroundColor: '#4caf50',
    marginTop: 12,
    position: 'relative',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  pitchImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  ball: {
    position: 'absolute',
    zIndex: 2,
  },
  ballAvatar: {
    backgroundColor: '#fff',
  },
  playerLabel: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 4,
    zIndex: 1,
  },
  playerText: {
    fontSize: 10,
    fontWeight: '500',
  },
  details: {
    marginTop: 16,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 8,
  },
  italic: {
    fontStyle: 'italic',
  },
});