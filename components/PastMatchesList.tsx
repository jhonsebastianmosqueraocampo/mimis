import { Fixture } from "@/types";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Avatar, Card, Divider } from "react-native-paper";

type PastMatchesListProps = {
  previousMatches: Fixture[];
  actionMatch: (id: string) => void;
  teamId?: string;
};

export default function PastMatchesList({
  previousMatches,
  teamId,
  actionMatch,
}: PastMatchesListProps) {
  const [searchText, setSearchText] = useState("");

  // 🧠 Filtrado por nombre de equipo
  const filteredMatches = useMemo(() => {
    if (!searchText.trim()) return previousMatches;
    const query = searchText.toLowerCase();
    return previousMatches.filter(
      (match) =>
        match.teams.home.name.toLowerCase().includes(query) ||
        match.teams.away.name.toLowerCase().includes(query)
    );
  }, [previousMatches, searchText]);

  // 🗂️ Agrupar partidos por ronda / jornada
  const groupedByRound = useMemo(() => {
    const groups: Record<string, Fixture[]> = {};
    filteredMatches.forEach((match) => {
      const round = match.league?.round || "Sin ronda";
      if (!groups[round]) groups[round] = [];
      groups[round].push(match);
    });
    return Object.entries(groups);
  }, [filteredMatches]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partidos Anteriores</Text>

      {/* 🔍 Buscador */}
      <TextInput
        placeholder="Buscar por nombre del equipo..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
        placeholderTextColor="#888"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={{ gap: 20 }}>
        {groupedByRound.length === 0 ? (
          <Text style={styles.noResults}>No se encontraron resultados.</Text>
        ) : (
          groupedByRound.map(([round, matches]) => (
            <View key={round}>
              <Text style={styles.roundTitle}>{round}</Text>

              {matches.map((match, index) => {
                const isHome = match.teams.home.id.toString() == teamId;
                const [teamScore, opponentScore] = isHome
                  ? [match.goals.home, match.goals.away]
                  : [match.goals.away, match.goals.home];

                let bgColor = "#f5f5f5";
                if (teamScore === opponentScore) bgColor = "#f0f0f0";
                else if (teamScore > opponentScore)
                  bgColor = "rgba(29, 185, 84, 0.15)";
                else bgColor = "rgba(229, 57, 53, 0.15)";

                const result = `${match.goals.home} - ${match.goals.away}`;
                const matchDate = dayjs(match.date).format("DD MMM YYYY");

                return (
                  <Card
                    key={index}
                    style={[styles.card, { backgroundColor: bgColor }]}
                    onPress={() => actionMatch(match.fixtureId.toString())}
                  >
                    <View style={styles.headerRow}>
                      <Text style={styles.date}>{matchDate}</Text>
                      <Text style={styles.tag}>{match.league.name}</Text>
                    </View>

                    <Divider style={styles.divider} />
                    <View style={styles.teamsRow}>
                      <View style={styles.teamBlock}>
                        <Avatar.Image
                          size={40}
                          source={{ uri: match.teams.home.logo }}
                          style={{ backgroundColor: "transparent" }}
                        />
                        <Text style={styles.teamName}>
                          {match.teams.home.name}
                        </Text>
                      </View>

                      <Text style={styles.result}>{result}</Text>

                      <View style={styles.teamBlock}>
                        <Avatar.Image
                          size={40}
                          source={{ uri: match.teams.away.logo }}
                          style={{ backgroundColor: "transparent" }}
                        />
                        <Text style={styles.teamName}>
                          {match.teams.away.name}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.stadiumRow}>
                      <Text style={styles.stadiumText}>{match.venue.name}</Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#000",
  },
  roundTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1B5E20",
    marginBottom: 8,
    marginLeft: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    color: "#000",
    backgroundColor: "#fff",
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    marginTop: 12,
    fontStyle: "italic",
  },
  scroll: { paddingRight: 4 },
  card: { padding: 12, borderRadius: 12, marginBottom: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  date: { fontWeight: "500" },
  tag: { fontSize: 12, color: "#666" },
  divider: { marginVertical: 8 },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 8,
  },
  teamBlock: { alignItems: "center", width: 80 },
  teamName: { marginTop: 4, fontSize: 12, textAlign: "center" },
  result: { fontWeight: "bold", fontSize: 16 },
  stadiumRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  stadiumText: { fontSize: 12, color: "#666", marginLeft: 4 },
});