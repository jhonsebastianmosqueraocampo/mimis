import React, { Fragment, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import type { LeagueTableProps } from "../types";

const descriptionColors: Record<string, string> = {
  "Champions League": "#1e90ff",
  "Europa League": "#ff7f50",
  "Conference League": "#9370db",
  Promotion: "#6a5acd",
  Relegation: "#dc143c",
  "Play-offs": "#ffa500",
  "": "transparent",
};

export default function LeagueTable({
  standings,
  selectedTeam,
  setSelectedTeam,
  teamId,
}: LeagueTableProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(
    selectedTeam ?? null
  );

  const handleTeamClick = (id: string) => {
    setExpandedTeam((prev) => (prev === id ? null : id));
    setSelectedTeam((prev) => (prev === id ? null : id));
  };

  const normalizeDescription = (desc?: string | null): string => {
    if (!desc) return "";

    if (desc.includes("Champions League")) return "Champions League";
    if (desc.includes("Europa League")) return "Europa League";
    if (desc.includes("Conference League")) return "Conference League";
    if (desc.includes("Promotion")) return "Promotion";
    if (desc.toLowerCase().includes("relegation")) return "Relegation";
    if (desc.includes("Play-offs")) return "Play-offs";

    return "";
  };

  return (
    <>
      <ScrollView horizontal>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {["#", "", "Equipo", "PJ", "PTS", "GF", "GC", "DG"].map((label) => (
              <Text key={label} style={styles.headerText}>
                {label}
              </Text>
            ))}
          </View>

          {standings?.map((team) => {
            const isUserTeam = team.team.id.toString() == teamId;
            const isExpanded = team.team.id.toString() == expandedTeam;
            const normalizedDesc = normalizeDescription(team.description);
            const hasDescription = !!normalizedDesc;
            const color = hasDescription
              ? descriptionColors[normalizedDesc] ?? "#ccc"
              : "transparent";

            return (
              <Fragment key={team.team.id}>
                <TouchableOpacity
                  onPress={() => handleTeamClick(team.team.id.toString())}
                >
                  <View
                    style={[
                      styles.row,
                      isUserTeam && styles.userRow,
                      { borderLeftColor: color },
                      hasDescription && styles.hasDescription,
                    ]}
                  >
                    <Text style={styles.rank}>{team.rank}</Text>
                    <Image
                      source={{ uri: team.team.logo }}
                      style={styles.logo}
                    />
                    <Text
                      style={[styles.teamName, isUserTeam && styles.userText]}
                    >
                      {team.team.name}
                    </Text>
                    <Text style={styles.cell}>{team.all.played}</Text>
                    <Text style={styles.cell}>{team.points}</Text>
                    <Text style={styles.cell}>{team.all.goals.for}</Text>
                    <Text style={styles.cell}>{team.all.goals.against}</Text>
                    <Text style={styles.cell}>{team.goalsDiff}</Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <Card style={styles.expandedCard}>
                    <Card.Content>
                      <Text style={styles.title}>Detalles del equipo</Text>

                      <Text style={styles.subtitle}>Forma reciente:</Text>
                      <View style={styles.formContainer}>
                        {team.form
                          ?.split("")
                          .map((char: string, idx: number) => (
                            <View
                              key={idx}
                              style={[
                                styles.formCircle,
                                char === "W"
                                  ? { backgroundColor: "green" }
                                  : char === "L"
                                  ? { backgroundColor: "red" }
                                  : { backgroundColor: "gray" },
                              ]}
                            />
                          ))}
                      </View>

                      <Divider style={{ marginVertical: 8 }} />

                      <Text style={styles.subtitle}>Resumen general</Text>
                      <Text>Posición: #{team.rank}</Text>
                      <Text>Puntos: {team.points}</Text>
                      <Text>
                        Diferencia de goles:{" "}
                        {team.all.goals.for - team.all.goals.against}
                      </Text>
                      <Text>
                        Total jugados: {team.all.played} ({team.home.played}{" "}
                        local / {team.away.played} visitante)
                      </Text>

                      <Divider style={{ marginVertical: 8 }} />

                      <Text style={styles.subtitle}>Local</Text>
                      <Text>Ganados: {team.home.win}</Text>
                      <Text>Empatados: {team.home.draw}</Text>
                      <Text>Perdidos: {team.home.lose}</Text>
                      <Text>
                        Goles: {team.home.goals.for} / Recibidos:{" "}
                        {team.home.goals.against}
                      </Text>

                      <Divider style={{ marginVertical: 8 }} />

                      <Text style={styles.subtitle}>Visitante</Text>
                      <Text>Ganados: {team.away.win}</Text>
                      <Text>Empatados: {team.away.draw}</Text>
                      <Text>Perdidos: {team.away.lose}</Text>
                      <Text>
                        Goles: {team.away.goals.for} / Recibidos:{" "}
                        {team.away.goals.against}
                      </Text>
                    </Card.Content>
                  </Card>
                )}
              </Fragment>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.legendContainer}>
        {Object.entries(descriptionColors).map(([desc, color]) => {
          if (!desc) return null; // ignora descripciones vacías
          return (
            <View key={desc} style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{desc}</Text>
            </View>
          );
        })}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  table: {
    width: 780,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#20232a",
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderLeftWidth: 4,
    elevation: 1,
  },
  userRow: {
    backgroundColor: "#e3fcec",
  },
  userText: {
    fontWeight: "bold",
    color: "#1db954",
  },
  rank: {
    flex: 0.5,
    textAlign: "center",
    fontWeight: "bold",
    color: "#444",
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  teamName: {
    flex: 2,
    fontSize: 13,
    color: "#333",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    color: "#333",
  },
  expandedCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 4,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
  },
  subtitle: {
    fontWeight: "600",
    marginTop: 6,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 0,
    paddingHorizontal: 10,
    gap: 12,
    paddingBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  legendText: {
    fontSize: 13,
    color: "#444",
  },
  hasDescription: {
    borderLeftWidth: 6,
  },
  formContainer: {
  flexDirection: "row",
  gap: 6,
  marginVertical: 6,
},

formCircle: {
  width: 14,
  height: 14,
  borderRadius: 7,
},
});
