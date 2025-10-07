import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, ProgressBar, useTheme } from "react-native-paper";

const possessionLineData = Array.from({ length: 90 }, (_, i) => {
  const minute = i + 1;
  const home = 50 + Math.sin(i / 10) * 10;
  const away = 100 - home;
  return { minute, home: +home.toFixed(1), away: +away.toFixed(1) };
});

const dummyStats = {
  possession: { home: 60, away: 40 },
  shots: { home: 14, away: 9 },
  shotsOnTarget: { home: 7, away: 3 },
  fouls: { home: 8, away: 11 },
  yellowCards: { home: 2, away: 3 },
  redCards: { home: 0, away: 1 },
  corners: { home: 5, away: 4 },
  saves: { home: 3, away: 6 },
  teams: { home: "FC Local", away: "AC Visitante" },
};

export default function MatchLiveStats() {
  const theme = useTheme();

  const renderStat = (
    label: string,
    home: number,
    away: number,
    icon: React.ReactNode
  ) => (
    <View style={styles.statRow}>
      <Text style={styles.statValue}>{home}</Text>
      <View style={styles.statLabel}>
        {icon}
        <Text style={styles.statText}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{away}</Text>
    </View>
  );

  return (
    <Card style={styles.card}>
      <Card.Title title="📊 Estadísticas en vivo" />
      <Card.Content>
        {/* Posesión */}
        <Text style={styles.centeredText}>Posesión</Text>
        <View style={styles.possessionRow}>
          <Text style={styles.statValue}>{dummyStats.possession.home}%</Text>
          <ProgressBar
            progress={dummyStats.possession.home / 100}
            color="#1DB954"
            style={styles.progressBar}
          />
          <Text style={styles.statValue}>{dummyStats.possession.away}%</Text>
        </View>

        {/* Estadísticas */}
        {renderStat(
          "Tiros",
          dummyStats.shots.home,
          dummyStats.shots.away,
          <MaterialCommunityIcons name="soccer" size={16} />
        )}
        {renderStat(
          "A puerta",
          dummyStats.shotsOnTarget.home,
          dummyStats.shotsOnTarget.away,
          <MaterialIcons name="insights" size={16} />
        )}
        {renderStat(
          "Faltas",
          dummyStats.fouls.home,
          dummyStats.fouls.away,
          <MaterialIcons name="sports-kabaddi" size={16} />
        )}
        {renderStat(
          "Amarillas",
          dummyStats.yellowCards.home,
          dummyStats.yellowCards.away,
          <MaterialIcons name="warning" size={16} color="gold" />
        )}
        {renderStat(
          "Rojas",
          dummyStats.redCards.home,
          dummyStats.redCards.away,
          <MaterialIcons name="warning" size={16} color="red" />
        )}
        {renderStat(
          "Corners",
          dummyStats.corners.home,
          dummyStats.corners.away,
          <MaterialCommunityIcons name="soccer-field" size={16} />
        )}
        {renderStat(
          "Atajadas",
          dummyStats.saves.home,
          dummyStats.saves.away,
          <MaterialIcons name="insights" size={16} />
        )}

        {/* Gráfico */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.graphTitle}>Posesión minuto a minuto</Text>
          {Array.from({ length: 6 }, (_, i) => {
            const start = i * 15 + 1;
            const end = (i + 1) * 15;
            const blockData = possessionLineData.slice(start - 1, end);
            const avgHome =
              blockData.reduce((sum, d) => sum + d.home, 0) / blockData.length;
            const avgAway =
              blockData.reduce((sum, d) => sum + d.away, 0) / blockData.length;

            return (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.minuteRange}>
                  Minutos {start}–{end}
                </Text>
                <Text style={styles.possessionText}>
                  {dummyStats.teams.home}: {avgHome.toFixed(1)}% —{" "}
                  {dummyStats.teams.away}: {avgAway.toFixed(1)}%
                </Text>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
  },
  centeredText: {
    textAlign: "center",
    marginBottom: 6,
    fontSize: 13,
  },
  possessionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  statLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    width: 40,
    textAlign: "center",
    fontWeight: "600",
  },
  statText: {
    fontSize: 13,
  },
  graphTitle: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "500",
  },
  minuteRange: {
  fontWeight: 'bold',
  fontSize: 13,
  marginBottom: 2,
  color: '#333',
},
possessionText: {
  fontSize: 13,
  color: '#555',
},
});
