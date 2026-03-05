import { colors } from "@/theme/colors";
import type { LiveMatch, RootStackParamList } from "@/types"; // ✅ asegúrate de importar correctamente
import { useNavigation } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type GroupStanding = {
  leagueId: number;
  season: number;
  group: string;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  rank: number;
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
};

type Props = {
  standings: GroupStanding[];
  teamId?: string;
  matches?: LiveMatch[]; // ✅ nuevo prop opcional
};

const GroupPhaseView = ({ standings, teamId, matches = [] }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // 🔍 Crear un mapa rápido para buscar si un equipo está en un partido en vivo
  const liveMatchMap = React.useMemo(() => {
    const map: Record<
      number,
      {
        opponent: string;
        goals: { home: number; away: number };
        isHome: boolean;
        elapsed?: number;
      }
    > = {};
    for (const match of matches) {
      if (!match?.status?.short) continue;
      const isLive = [
        "1H",
        "HT",
        "2H",
        "ET",
        "BT",
        "P",
        "LIVE",
        "INT",
      ].includes(match.status.short);
      if (!isLive) continue;

      // Asocia ambos equipos al partido
      map[match.teams.home.id] = {
        opponent: match.teams.away.name,
        goals: match.goals,
        isHome: true,
        elapsed: match.status.elapsed,
      };
      map[match.teams.away.id] = {
        opponent: match.teams.home.name,
        goals: match.goals,
        isHome: false,
        elapsed: match.status.elapsed,
      };
    }
    return map;
  }, [matches]);

  const grouped = standings.reduce(
    (acc, curr) => {
      const groupKey = `${curr.group}-${curr.leagueId}-${curr.season}`;
      if (!acc[groupKey]) acc[groupKey] = { name: curr.group, teams: [] };
      acc[groupKey].teams.push(curr);
      return acc;
    },
    {} as Record<string, { name: string; teams: GroupStanding[] }>,
  );

  const seenGroups = new Set();

  const handleTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(grouped).map(([key, { name, teams }]) => {
        if (seenGroups.has(name)) return null;
        seenGroups.add(name);

        return (
          <View key={key} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>Grupo {name}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 500 }}>
                <View style={[styles.row, styles.header]}>
                  <Text style={[styles.cellRank, styles.bold]}>#</Text>
                  <Text style={[styles.cellTeam, styles.bold]}>Equipo</Text>
                  <Text style={[styles.cell, styles.bold]}>PJ</Text>
                  <Text style={[styles.cell, styles.bold]}>G</Text>
                  <Text style={[styles.cell, styles.bold]}>E</Text>
                  <Text style={[styles.cell, styles.bold]}>P</Text>
                  <Text style={[styles.cell, styles.bold]}>GF</Text>
                  <Text style={[styles.cell, styles.bold]}>GC</Text>
                  <Text style={[styles.cell, styles.bold]}>Pts</Text>
                </View>

                {teams
                  .sort((a, b) => a.rank - b.rank)
                  .map((team) => {
                    const isFavorite = team.team.id.toString() === teamId;

                    // ⚽️ Buscar si el equipo está jugando en vivo
                    const live = liveMatchMap[team.team.id];
                    const isLive = !!live;

                    // 📊 Mostrar resultado si está en vivo
                    const scoreDisplay = isLive
                      ? live.isHome
                        ? `${live.goals.home} - ${live.goals.away}`
                        : `${live.goals.away} - ${live.goals.home}`
                      : null;

                    return (
                      <TouchableOpacity
                        key={team.team.id}
                        style={[
                          styles.row,
                          styles.teamRow,
                          isFavorite && styles.favoriteRow,
                          isLive && styles.liveRow,
                        ]}
                        onPress={() => handleTeam(team.team.id.toString())}
                      >
                        <Text
                          style={[
                            styles.cellRank,
                            isFavorite && styles.favoriteText,
                            isLive && styles.liveText,
                          ]}
                        >
                          {team.rank}
                        </Text>

                        <View style={styles.teamCell}>
                          <Image
                            source={{ uri: team.team.logo }}
                            style={styles.logo}
                          />
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.teamName,
                                isFavorite && styles.favoriteText,
                                isLive && styles.liveText,
                              ]}
                            >
                              {team.team.name}
                            </Text>

                            {/* ⚡ Mostrar marcador si el equipo está en vivo */}
                            {isLive && (
                              <View style={styles.liveBadge}>
                                <Text style={styles.liveScore}>
                                  {scoreDisplay}
                                </Text>
                                <Text style={styles.liveElapsed}>
                                  {live.elapsed ? `${live.elapsed}'` : ""}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <Text style={styles.cell}>{team.all.played}</Text>
                        <Text style={styles.cell}>{team.all.win}</Text>
                        <Text style={styles.cell}>{team.all.draw}</Text>
                        <Text style={styles.cell}>{team.all.lose}</Text>
                        <Text style={styles.cell}>{team.all.goals.for}</Text>
                        <Text style={styles.cell}>
                          {team.all.goals.against}
                        </Text>
                        <Text style={[styles.cell, styles.bold]}>
                          {team.points}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 32,
  },
  groupContainer: {
    marginBottom: 28,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "left",
    marginBottom: 10,
    marginLeft: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 6,
    marginBottom: 2,
    paddingHorizontal: 6,
  },
  header: {
    backgroundColor: colors.background,
  },
  teamRow: {
    backgroundColor: colors.background,
  },
  favoriteRow: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
  },
  liveRow: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 0.5,
  },
  cellRank: {
    width: 26,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
  },
  cell: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  teamCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 4,
  },
  teamName: {
    fontSize: 13,
    flexShrink: 1,
  },
  cellTeam: {
    flex: 1,
    fontSize: 13,
    paddingLeft: 4,
  },
  favoriteText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  liveText: {
    color: colors.error,
    fontWeight: "700",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 4,
  },
  liveScore: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "700",
  },
  liveElapsed: {
    fontSize: 11,
    color: colors.error,
    marginLeft: 3,
  },
});

export default GroupPhaseView;
