import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { useNavigation } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Divider } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import type {
  LeagueTableProps,
  RootStackParamList,
  TeamStanding,
} from "../types";

export default function LeagueTable({
  standings,
  matches,
  selectedTeam,
  setSelectedTeam,
  teamId,
  equiposFavoritos,
}: LeagueTableProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeamData, setSelectedTeamData] = useState<TeamStanding>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const favoriteSet = useMemo(() => {
    if (!equiposFavoritos) return new Set();
    return new Set(equiposFavoritos.map((f) => f.title.toLowerCase()));
  }, [equiposFavoritos]);

  const handleTeamClick = (team: TeamStanding) => {
    const teamIdStr = team.team.id.toString();
    setSelectedTeam((prev) => (prev === teamIdStr ? null : teamIdStr));
    setSelectedTeamData(team);
    setModalVisible(true);
  };

  // 🟢 Verificar si un equipo está jugando en vivo y devolver su marcador
  const getLiveScore = (teamId: number) => {
    const match = matches?.find(
      (m) =>
        (m.teams.home.id === teamId || m.teams.away.id === teamId) &&
        ["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"].includes(
          m.status.short,
        ),
    );

    if (!match) return null;

    const isHome = match.teams.home.id === teamId;
    const goalsFor = isHome ? match.goals.home : match.goals.away;
    const goalsAgainst = isHome ? match.goals.away : match.goals.home;

    return `${goalsFor}-${goalsAgainst}`;
  };

  const handleTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  return (
    <>
      <View style={styles.tableContainer}>
        {/* 🧱 Columna fija */}
        <View style={styles.fixedColumn}>
          <View style={styles.headerFixed}>
            <Text style={[styles.headerText, { width: 30 }]}>#</Text>
            <Text style={[styles.headerText, { width: 100 }]}>Equipo</Text>
          </View>

          {standings?.map((team) => {
            const color = "transparent";
            const isUserTeam = team.team.id.toString() === teamId;
            const isSelected = selectedTeam === team.team.id.toString();

            const liveScore = getLiveScore(team.team.id);
            const isFavoriteTeam = favoriteSet.has(
              team.team.name.toLowerCase(),
            );

            return (
              <TouchableOpacity
                key={team.team.id}
                onPress={() => handleTeamClick(team)}
              >
                <View
                  style={[
                    styles.fixedRow,
                    isUserTeam && styles.userRow,
                    isSelected && styles.selectedRow,
                    isFavoriteTeam && styles.favoriteRow,
                    { borderLeftColor: color },
                    styles.hasDescription,
                  ]}
                >
                  <Text style={styles.rank}>{team.rank}</Text>
                  <Image source={{ uri: team.team.logo }} style={styles.logo} />

                  {/* 🟢 Nombre + marcador si está en vivo */}
                  <View style={styles.teamInfo}>
                    <Text
                      style={[
                        styles.teamName,
                        (isUserTeam || isSelected) && styles.userText,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {team.team.name}
                    </Text>

                    {liveScore && (
                      <Text style={styles.liveScore}>{liveScore}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 📊 Scroll de estadísticas */}
        <ScrollView horizontal>
          <View style={styles.scrollSection}>
            <View style={styles.headerScroll}>
              {["PTS", "PJ", "GF", "GC", "DG"].map((label) => (
                <Text key={label} style={styles.headerText}>
                  {label}
                </Text>
              ))}
            </View>

            {standings?.map((team) => {
              const isUserTeam = team.team.id.toString() === teamId;
              const isSelected = selectedTeam === team.team.id.toString();
              const isFavoriteTeam = favoriteSet.has(
                team.team.name.toLowerCase(),
              );
              return (
                <TouchableOpacity
                  key={`scroll-${team.team.id}`}
                  onPress={() => handleTeamClick(team)}
                >
                  <View
                    style={[
                      styles.scrollRow,
                      isUserTeam && styles.userRow,
                      isSelected && styles.selectedRow,
                      isFavoriteTeam && styles.favoriteRow,
                    ]}
                  >
                    <Text style={styles.cell}>{team.points}</Text>
                    <Text style={styles.cell}>{team.all.played}</Text>
                    <Text style={styles.cell}>{team.all.goals.for}</Text>
                    <Text style={styles.cell}>{team.all.goals.against}</Text>
                    <Text style={styles.cell}>{team.goalsDiff}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 🪄 Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedTeamData && (
              <TouchableOpacity
                onPress={() => handleTeam(selectedTeamData.team.id.toString())}
              >
                <Text style={styles.modalTitle}>
                  {selectedTeamData.team.name}
                </Text>

                <View style={styles.formContainer}>
                  {selectedTeamData.form
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
                <Text>Posición: #{selectedTeamData.rank}</Text>
                <Text>Puntos: {selectedTeamData.points}</Text>
                <Text>Diferencia de goles: {selectedTeamData.goalsDiff}</Text>
                <Text>
                  Total jugados: {selectedTeamData.all.played} (Local:{" "}
                  {selectedTeamData.home.played} / Visitante:{" "}
                  {selectedTeamData.away.played})
                </Text>

                <Divider style={{ marginVertical: 8 }} />

                <Text style={styles.subtitle}>Local</Text>
                <Text>Ganados: {selectedTeamData.home.win}</Text>
                <Text>Empatados: {selectedTeamData.home.draw}</Text>
                <Text>Perdidos: {selectedTeamData.home.lose}</Text>

                <Divider style={{ marginVertical: 8 }} />

                <Text style={styles.subtitle}>Visitante</Text>
                <Text>Ganados: {selectedTeamData.away.win}</Text>
                <Text>Empatados: {selectedTeamData.away.draw}</Text>
                <Text>Perdidos: {selectedTeamData.away.lose}</Text>

                <Button
                  mode="contained"
                  style={{ marginTop: 16, backgroundColor: colors.primary }}
                  onPress={() => setModalVisible(false)}
                >
                  Cerrar
                </Button>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: "row",
    paddingBottom: spacing.xl,
  },

  fixedColumn: {
    width: 200,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderColor: colors.border,
    zIndex: 2,
    elevation: 5,
  },

  headerFixed: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceVariant ?? colors.primary,
    height: 44,
  },

  scrollSection: {
    backgroundColor: colors.surface,
  },

  headerScroll: {
    flexDirection: "row",
    backgroundColor: colors.surfaceVariant ?? colors.primary,
    height: 44,
    alignItems: "center",
  },

  headerText: {
    ...typography.small,
    color: colors.textOnPrimary,
    fontWeight: "600",
    textAlign: "center",
    width: 60,
  },

  fixedRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    height: 44,
  },

  scrollRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: colors.border,
    height: 44,
  },

  logo: {
    width: 22,
    height: 22,
    marginHorizontal: spacing.xs,
  },

  rank: {
    width: 30,
    textAlign: "center",
    fontWeight: "700",
    color: colors.textSecondary,
  },

  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs ?? 4,
  },

  teamName: {
    ...typography.small,
    width: 110,
    color: colors.textPrimary,
  },

  liveScore: {
    backgroundColor: colors.success ?? "#00c853",
    color: colors.textOnPrimary,
    fontWeight: "700",
    fontSize: 11,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs ?? 2,
    borderRadius: radius.sm,
  },

  cell: {
    ...typography.small,
    width: 60,
    textAlign: "center",
    color: colors.textPrimary,
  },

  userRow: {
    backgroundColor: colors.textSecondary,
  },

  selectedRow: {
    backgroundColor: colors.info,
  },

  userText: {
    fontWeight: "700",
    color: colors.primary,
  },

  hasDescription: {
    borderLeftWidth: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: "85%",
    maxHeight: "80%",
  },

  modalTitle: {
    ...typography.title,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.body,
    fontWeight: "600",
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },

  formContainer: {
    flexDirection: "row",
    gap: spacing.xs ?? 6,
    marginVertical: spacing.xs ?? 6,
    justifyContent: "center",
  },

  formCircle: {
    width: 14,
    height: 14,
    borderRadius: radius.round,
  },

  favoriteRow: {
    backgroundColor: colors.warning,
    borderLeftWidth: 6,
    borderLeftColor: colors.warning,
    shadowColor: colors.warning,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
