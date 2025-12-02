import { Fixture } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Avatar, Card } from "react-native-paper";

dayjs.extend(relativeTime);

type UpcomingMatchesListProps = {
  upcomingMatches: Fixture[];
  teamId?: string;
  actionMatch: (id: string) => void;
};

export default function UpcomingMatchesList({
  upcomingMatches,
  teamId,
  actionMatch,
}: UpcomingMatchesListProps) {
  const [searchText, setSearchText] = useState("");

  // 🧠 Filtrar partidos por nombre del equipo (home o away)
  const filteredMatches = useMemo(() => {
    if (!searchText.trim()) return upcomingMatches;
    const query = searchText.toLowerCase();
    return upcomingMatches.filter(
      (match) =>
        match.teams.home.name.toLowerCase().includes(query) ||
        match.teams.away.name.toLowerCase().includes(query)
    );
  }, [upcomingMatches, searchText]);

  // 🗂️ Agrupar partidos por jornada / ronda
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
      {/* 🔍 Buscador */}
      <TextInput
        placeholder="Buscar por nombre del equipo..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
        placeholderTextColor="#888"
      />

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: 20 }}>
        {groupedByRound.length === 0 ? (
          <Text style={styles.noResults}>No se encontraron resultados.</Text>
        ) : (
          groupedByRound.map(([round, matches]) => (
            <View key={round}>
              <Text style={styles.roundTitle}>{round}</Text>

              {matches.map((match, index) => {
                const isHome = match.teams.home.id.toString() == teamId;
                const matchDate = dayjs(match.date);
                const formattedDate = matchDate.format("DD MMM YYYY, HH:mm");
                const timeUntil = matchDate.fromNow();

                const bgColor = "#ffffff";
                const borderColor = isHome ? "#1DB954" : "#F78E4F"; // Verde si local, naranja si visitante
                const tagColor = borderColor;

                return (
                  <Card
                    key={index}
                    style={[
                      styles.card,
                      { backgroundColor: bgColor, borderLeftColor: borderColor },
                    ]}
                    elevation={2}
                    onPress={() => actionMatch(match.fixtureId.toString())}
                  >
                    <View style={styles.header}>
                      <Text style={[styles.dateText, { color: borderColor }]}>
                        {formattedDate}
                      </Text>
                      <Text style={[styles.tag, { color: tagColor }]}>
                        {match.league.name}
                      </Text>
                    </View>

                    <View style={styles.teams}>
                      <View style={styles.team}>
                        <Avatar.Image
                          style={{ backgroundColor: "transparent" }}
                          size={42}
                          source={{ uri: match.teams.home.logo }}
                        />
                        <Text style={styles.teamName}>
                          {match.teams.home.name}
                        </Text>
                      </View>

                      <Text style={[styles.vs, { color: borderColor }]}>VS</Text>

                      <View style={styles.team}>
                        <Avatar.Image
                          style={{ backgroundColor: "transparent" }}
                          size={42}
                          source={{ uri: match.teams.away.logo }}
                        />
                        <Text style={styles.teamName}>
                          {match.teams.away.name}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.stadiumText}>{match.venue.name}</Text>
                    <Text style={styles.timeUntil}>Comienza {timeUntil}</Text>
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
  container: {
    marginBottom: 20,
    paddingHorizontal: 12,
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
  scrollArea: {
    paddingRight: 4,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateText: {
    fontWeight: "600",
    fontSize: 14,
  },
  tag: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  teams: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 12,
  },
  team: {
    alignItems: "center",
    width: 90,
  },
  teamName: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    color: "#333",
  },
  vs: {
    fontWeight: "bold",
    fontSize: 16,
  },
  stadiumText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 4,
  },
  timeUntil: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});