import { CupStanding } from "@/types";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type KnockoutBracketProps = {
  standings: CupStanding[];
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

function MatchDateStatus(date: string){
  const parsedDate = new Date(date);
  const now = new Date();

  const diffMinutes = (now.getTime() - parsedDate.getTime()) / 60000;
  let status = "Próximo";
  let color = "green";

  if (diffMinutes >= 0 && diffMinutes <= 120) {
    status = "En curso";
    color = "orange";
  } else if (diffMinutes > 120) {
    status = "Finalizado";
    color = "gray";
  }

  const formattedDate = parsedDate.toLocaleString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} - ${status}`
}

export function KnockoutBracket({ standings, teamId }: KnockoutBracketProps) {
  const grouped = groupMatchesByKey(standings);
  const rounds = Array.from(new Set(standings.map((m) => m.round)));
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {rounds.map((round) => {
        const roundMatches = Object.entries(grouped).filter(([key, _]) =>
          key.startsWith(round)
        );

        return (
          <View key={round} style={styles.roundColumn}>
            <Text style={styles.roundTitle}>{round}</Text>
            {roundMatches.map(([key, matches]) => {
              const match = matches[0];
              const homeTeam = match.homeTeam;
              const awayTeam = match.awayTeam;

              // Total de goles por ID
              const goalsByTeamId: Record<number, number> = {};
              matches.forEach((m) => {
                goalsByTeamId[m.homeTeam.id] =
                  (goalsByTeamId[m.homeTeam.id] ?? 0) + (m.goals.home ?? 0);
                goalsByTeamId[m.awayTeam.id] =
                  (goalsByTeamId[m.awayTeam.id] ?? 0) + (m.goals.away ?? 0);
              });

              const isExpanded = expandedKey === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.matchBox}
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(key)}
                >
                  {[homeTeam, awayTeam].map((team) => {
                    const isHighlighted = team.id.toString() === teamId;
                    const score = goalsByTeamId[team.id] ?? "-";

                    return (
                      <View
                        key={team.id}
                        style={[
                          styles.teamRow,
                          isHighlighted && styles.highlighted,
                        ]}
                      >
                        <Image
                          source={{ uri: team.logo }}
                          style={styles.avatar}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.teamName,
                            isHighlighted && styles.textWhite,
                          ]}
                        >
                          {team.name}
                        </Text>
                        <Text
                          style={[
                            styles.teamScore,
                            isHighlighted && styles.textWhite,
                          ]}
                        >
                          {score}
                        </Text>
                      </View>
                    );
                  })}

                  {isExpanded && (
                    <View style={styles.details}>
                      {matches.map((m, i) => (
                        <View key={i} style={styles.detailRow}>
                          <Text style={styles.detailText}>
                            {m.homeTeam.name} {m.goals.home ?? "-"} -{" "}
                            {m.goals.away ?? "-"} {m.awayTeam.name}
                          </Text>
                          <Text style={styles.detailSub}>
                            {
                            MatchDateStatus(m.date.toString())
                            }
                          </Text>
                        </View>
                      ))}
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
});
