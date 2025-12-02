import { CupStanding, LiveMatch, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type KnockoutBracketProps = {
  standings: CupStanding[];
  matches?: LiveMatch[];
  teamId?: string;
};

function groupMatchesByKey(matches: CupStanding[]) {
  const grouped: Record<string, CupStanding[]> = {};

  for (const match of matches) {
    const ids = [match.homeTeam.id, match.awayTeam.id].sort((a, b) => a - b);
    const key = `${match.round}-${ids[0]}-${ids[1]}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(match);
  }

  return grouped;
}

function MatchDateStatus(date: string) {
  const parsedDate = new Date(date);
  const now = new Date();
  const diffMinutes = (now.getTime() - parsedDate.getTime()) / 60000;

  let status = "Próximo";
  if (diffMinutes >= 0 && diffMinutes <= 120) status = "En curso";
  else if (diffMinutes > 120) status = "Finalizado";

  const formattedDate = parsedDate.toLocaleString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} - ${status}`;
}

export function KnockoutBracket({ standings, teamId, matches = [] }: KnockoutBracketProps) {
  const grouped = groupMatchesByKey(standings);
  const rounds = Array.from(new Set(standings.map((m) => m.round)));
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 🧠 Crear mapa rápido de partidos en vivo por IDs de equipos
  const liveMap = useMemo(() => {
    const map: Record<
      number,
      { goals: { home: number; away: number }; isHome: boolean; elapsed?: number; fixtureId: number }
    > = {};

    for (const match of matches) {
      if (!match || !match.status) continue;
      const liveStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"];
      if (!liveStatuses.includes(match.status.short)) continue;

      map[match.teams.home.id] = {
        goals: match.goals,
        isHome: true,
        elapsed: match.status.elapsed,
        fixtureId: match.fixtureId,
      };
      map[match.teams.away.id] = {
        goals: match.goals,
        isHome: false,
        elapsed: match.status.elapsed,
        fixtureId: match.fixtureId,
      };
    }

    return map;
  }, [matches]);

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handleTeam = (id: string) => {
    navigation.navigate('team', {id})
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {rounds.map((round) => {
        const roundMatches = Object.entries(grouped).filter(([key]) =>
          key.startsWith(round)
        );

        return (
          <View key={round} style={styles.roundColumn}>
            <Text style={styles.roundTitle}>{round}</Text>
            {roundMatches.map(([key, matches]) => {
              const match = matches[0];
              const homeTeam = match.homeTeam;
              const awayTeam = match.awayTeam;
              const isExpanded = expandedKey === key;

              // 🏟️ Total de goles sumados
              const goalsByTeamId: Record<number, number> = {};
              matches.forEach((m) => {
                goalsByTeamId[m.homeTeam.id] =
                  (goalsByTeamId[m.homeTeam.id] ?? 0) + (m.goals.home ?? 0);
                goalsByTeamId[m.awayTeam.id] =
                  (goalsByTeamId[m.awayTeam.id] ?? 0) + (m.goals.away ?? 0);
              });

              // ⚡ Verificar si alguno de los equipos está jugando en vivo
              const homeLive = liveMap[homeTeam.id];
              const awayLive = liveMap[awayTeam.id];
              const isLive = !!homeLive || !!awayLive;

              // 📊 Marcador actual si está en vivo
              let liveScore = null;
              let liveElapsed = null;
              if (isLive) {
                const source = homeLive || awayLive;
                liveScore = `${source.goals.home} - ${source.goals.away}`;
                liveElapsed = source.elapsed ? `${source.elapsed}'` : "";
              }

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.matchBox,
                    isLive && styles.liveMatchBox, // 🔥 color si está en vivo
                  ]}
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(key)}
                >
                  {[homeTeam, awayTeam].map((team) => {
                    const isHighlighted = team.id.toString() === teamId;
                    const score = goalsByTeamId[team.id] ?? "-";

                    // 🟢 Si está en vivo, usar el marcador actual
                    const showScore = isLive
                      ? homeLive?.isHome && team.id === homeTeam.id
                        ? liveScore
                        : awayLive?.isHome === false && team.id === awayTeam.id
                        ? liveScore
                        : score
                      : score;

                    return (
                      <TouchableOpacity
                        key={team.id}
                        style={[
                          styles.teamRow,
                          isHighlighted && styles.highlighted,
                        ]}
                        onPress={()=>handleTeam(team.id.toString())}
                      >
                        <Image source={{ uri: team.logo }} style={styles.avatar} />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.teamName,
                            isHighlighted && styles.textWhite,
                            isLive && styles.liveText,
                          ]}
                        >
                          {team.name}
                        </Text>
                        <Text
                          style={[
                            styles.teamScore,
                            isHighlighted && styles.textWhite,
                            isLive && styles.liveText,
                          ]}
                        >
                          {showScore}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* ⚡ Detalle expandido con información en vivo */}
                  {isExpanded && (
                    <View style={styles.details}>
                      {matches.map((m, i) => (
                        <View key={i} style={styles.detailRow}>
                          <Text style={styles.detailText}>
                            {m.homeTeam.name} {m.goals.home ?? "-"} - {m.goals.away ?? "-"}{" "}
                            {m.awayTeam.name}
                          </Text>
                          <Text style={styles.detailSub}>
                            {MatchDateStatus(m.date.toString())}
                          </Text>
                        </View>
                      ))}

                      {/* Indicador de partido en vivo */}
                      {isLive && (
                        <View style={styles.liveInfo}>
                          <Text style={styles.liveNow}>
                            🟢 En vivo {liveElapsed ? `(${liveElapsed})` : ""}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  roundColumn: {
    minWidth: 160,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  roundTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 14,
    textAlign: "center",
  },
  matchBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 24,
    width: "100%",
    elevation: 2,
  },
  liveMatchBox: {
    backgroundColor: "#fff6f6",
    borderColor: "#ff4d4f",
    borderWidth: 1,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  teamName: {
    flex: 1,
    fontSize: 13,
    color: "#000",
  },
  teamScore: {
    fontWeight: "bold",
    color: "#000",
  },
  highlighted: {
    backgroundColor: "#e53935",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  textWhite: {
    color: "#fff",
  },
  details: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 6,
  },
  detailRow: {
    marginVertical: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#333",
  },
  detailSub: {
    fontSize: 10,
    color: "#777",
  },
  liveInfo: {
    marginTop: 6,
    alignItems: "center",
  },
  liveNow: {
    fontSize: 12,
    color: "#d32f2f",
    fontWeight: "700",
  },
  liveText: {
    color: "#d32f2f",
    fontWeight: "700",
  },
});
