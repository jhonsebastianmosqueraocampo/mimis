import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
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
    marginBottom: spacing.lg,
    alignItems: "center",
  },

  photo: {
    width: 70,
    height: 70,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceVariant ?? colors.border,
  },

  playerName: {
    ...typography.title,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  subText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs ?? 2,
  },

  /* Chips */
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs ?? 6,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceVariant ?? colors.surface,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    ...typography.small,
    color: colors.textSecondary,
  },

  chipTextSelected: {
    fontWeight: "600",
    ...typography.small,
    color: colors.textOnPrimary,
  },

  /* Card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  leagueLogo: {
    width: 32,
    height: 32,
    marginRight: spacing.sm,
  },

  leagueName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
  },

  sectionTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: spacing.xs ?? 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs ?? 4,
  },

  label: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },

  value: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
});
