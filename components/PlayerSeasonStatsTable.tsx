import { PlayerB } from '@/types';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PlayerStatsProps = {
  player: PlayerB;
};

export default function PlayerStatisticsView({ player }: PlayerStatsProps) {
  const [selectedLeagueIndex, setSelectedLeagueIndex] = useState(0);
  const selectedStat = player.statistics[selectedLeagueIndex];

  return (
    <>
      {/* Header con foto y datos principales */}
      <View style={styles.header}>
        <Image source={{ uri: player.photo }} style={styles.photo} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.subText}>
            {player.nationality} • {player.age} años
          </Text>
          <Text style={styles.subText}>
            {player.height} • {player.weight}
          </Text>
        </View>
      </View>

      {/* Chips de ligas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {player.statistics.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              index === selectedLeagueIndex && styles.chipSelected
            ]}
            onPress={() => setSelectedLeagueIndex(index)}
          >
            <Text
              style={[
                styles.chipText,
                index === selectedLeagueIndex && styles.chipTextSelected
              ]}
            >
              {stat.league.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Estadísticas de la liga seleccionada */}
      <View style={styles.card}>
        {/* Encabezado liga */}
        <View style={styles.leagueHeader}>
          {selectedStat.league.logo && (
            <Image source={{ uri: selectedStat.league.logo }} style={styles.leagueLogo} />
          )}
          <View>
            <Text style={styles.leagueName}>{selectedStat.league.name}</Text>
            <Text style={styles.subText}>
              {selectedStat.league.country} • Temporada {selectedStat.league.season}
            </Text>
          </View>
        </View>

        {/* Sección Juegos */}
        <Text style={styles.sectionTitle}>Juegos</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Posición:</Text>
          <Text style={styles.value}>{selectedStat.games.position ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Partidos (Titular / Suplente):</Text>
          <Text style={styles.value}>
            {selectedStat.games.appearences ?? 0} ({selectedStat.games.lineups ?? 0} / {selectedStat.substitutes.in ?? 0})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Minutos:</Text>
          <Text style={styles.value}>{selectedStat.games.minutes ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Capitán:</Text>
          <Text style={styles.value}>{selectedStat.games.captain ? 'Sí' : 'No'}</Text>
        </View>

        {/* Sección Ataque */}
        <Text style={styles.sectionTitle}>Ataque</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Goles:</Text>
          <Text style={styles.value}>{selectedStat.goals.total ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Asistencias:</Text>
          <Text style={styles.value}>{selectedStat.goals.assists ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tiros (a puerta):</Text>
          <Text style={styles.value}>
            {selectedStat.shots.total ?? 0} ({selectedStat.shots.on ?? 0})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dribles (éxito):</Text>
          <Text style={styles.value}>
            {selectedStat.dribbles.attempts ?? 0} ({selectedStat.dribbles.success ?? 0})
          </Text>
        </View>

        {/* Sección Pases */}
        <Text style={styles.sectionTitle}>Pases</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Totales:</Text>
          <Text style={styles.value}>{selectedStat.passes.total ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Clave:</Text>
          <Text style={styles.value}>{selectedStat.passes.key ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Precisión:</Text>
          <Text style={styles.value}>{selectedStat.passes.accuracy ?? '-'}</Text>
        </View>

        {/* Sección Defensa */}
        <Text style={styles.sectionTitle}>Defensa</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tackles:</Text>
          <Text style={styles.value}>{selectedStat.tackles.total ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Intercepciones:</Text>
          <Text style={styles.value}>{selectedStat.tackles.interceptions ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Duelos (Ganados / Totales):</Text>
          <Text style={styles.value}>
            {selectedStat.duels.won ?? 0} / {selectedStat.duels.total ?? 0}
          </Text>
        </View>

        {/* Sección Disciplina */}
        <Text style={styles.sectionTitle}>Disciplina</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Faltas (Cometidas / Recibidas):</Text>
          <Text style={styles.value}>
            {selectedStat.fouls.committed ?? 0} / {selectedStat.fouls.drawn ?? 0}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tarjetas:</Text>
          <Text style={styles.value}>
            🟨 {selectedStat.cards.yellow ?? 0} | 🟧 {selectedStat.cards.yellowred ?? 0} | 🟥 {selectedStat.cards.red ?? 0}
          </Text>
        </View>

        {/* Sección Penales */}
        <Text style={styles.sectionTitle}>Penales</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Anotados:</Text>
          <Text style={styles.value}>{selectedStat.penalty.scored ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fallados:</Text>
          <Text style={styles.value}>{selectedStat.penalty.missed ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Atajados:</Text>
          <Text style={styles.value}>{selectedStat.penalty.saved ?? 0}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  subText: {
    color: '#aaa',
    fontSize: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#ccc',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leagueLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  leagueName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  label: {
    color: '#bbb',
  },
  value: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
