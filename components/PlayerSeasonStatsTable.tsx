import AdBanner from "@/services/ads/AdBanner";
import { PlayerB, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type PlayerStatsProps = {
  player: PlayerB;
};

export default function PlayerStatisticsView({ player }: PlayerStatsProps) {
  const [selectedLeagueIndex, setSelectedLeagueIndex] = useState(0);
  const selectedStat = player.statistics[selectedLeagueIndex];
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLeague = (id: string) => {
    navigation.navigate("tournament", { id });
  };

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        {player.statistics.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              index === selectedLeagueIndex && styles.chipSelected,
            ]}
            onPress={() => setSelectedLeagueIndex(index)}
          >
            <Text
              style={[
                styles.chipText,
                index === selectedLeagueIndex && styles.chipTextSelected,
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
        <TouchableOpacity
          style={styles.leagueHeader}
          onPress={() => handleLeague(selectedStat.league.id?.toString() ?? "")}
        >
          {selectedStat.league.logo && (
            <Image
              source={{ uri: selectedStat.league.logo }}
              style={styles.leagueLogo}
            />
          )}
          <View>
            <Text style={styles.leagueName}>{selectedStat.league.name}</Text>
            <Text style={styles.subText}>
              {selectedStat.league.country} • Temporada{" "}
              {selectedStat.league.season}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sección Juegos */}
        <Text style={styles.sectionTitle}>Juegos</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Posición:</Text>
          <Text style={styles.value}>{selectedStat.games.position ?? "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Partidos (Titular / Suplente):</Text>
          <Text style={styles.value}>
            {selectedStat.games.appearences ?? 0} (
            {selectedStat.games.lineups ?? 0} /{" "}
            {selectedStat.substitutes.in ?? 0})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Minutos:</Text>
          <Text style={styles.value}>{selectedStat.games.minutes ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Capitán:</Text>
          <Text style={styles.value}>
            {selectedStat.games.captain ? "Sí" : "No"}
          </Text>
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
            {selectedStat.dribbles.attempts ?? 0} (
            {selectedStat.dribbles.success ?? 0})
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
          <Text style={styles.value}>
            {selectedStat.passes.accuracy ?? "-"}
          </Text>
        </View>

        {/* Sección Defensa */}
        <Text style={styles.sectionTitle}>Defensa</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tackles:</Text>
          <Text style={styles.value}>{selectedStat.tackles.total ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Intercepciones:</Text>
          <Text style={styles.value}>
            {selectedStat.tackles.interceptions ?? 0}
          </Text>
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
            {selectedStat.fouls.committed ?? 0} /{" "}
            {selectedStat.fouls.drawn ?? 0}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tarjetas:</Text>
          <Text style={styles.value}>
            🟨 {selectedStat.cards.yellow ?? 0} | 🟧{" "}
            {selectedStat.cards.yellowred ?? 0} | 🟥{" "}
            {selectedStat.cards.red ?? 0}
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

      <View style={{ marginTop: 24, alignItems: "center" }}>
        <AdBanner />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },

  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#eee",
  },

  playerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  subText: {
    color: "#666",
    fontSize: 14,
    marginTop: 2,
  },

  /* Chips */
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  chipSelected: {
    backgroundColor: "#1DB954",
    borderColor: "#1DB954",
  },

  chipText: {
    color: "#555",
    fontSize: 14,
  },

  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },

  /* Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },

  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  leagueLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },

  leagueName: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#1DB954",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  label: {
    color: "#555",
    fontSize: 14,
    flex: 1,
  },

  value: {
    color: "#222",
    fontWeight: "600",
    marginLeft: 8,
  },
});
