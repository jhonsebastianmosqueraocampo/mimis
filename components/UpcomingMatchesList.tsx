import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { Fixture, swiperItem } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar, Card, Chip } from "react-native-paper";

dayjs.extend(relativeTime);

type UpcomingMatchesListProps = {
  upcomingMatches: Fixture[];
  teamId?: string;
  actionMatch: (id: string) => void;
  equiposFavoritos?: swiperItem[];
};

export default function UpcomingMatchesList({
  upcomingMatches,
  teamId,
  actionMatch,
  equiposFavoritos,
}: UpcomingMatchesListProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedFavoriteTeam, setSelectedFavoriteTeam] = useState<
    string | "ALL"
  >("ALL");

  const favoriteTeamsInUpcoming = useMemo(() => {
    if (!equiposFavoritos || !upcomingMatches) return [];

    // Extraer los nombres de equipos que aparecen en los próximos partidos
    const teamsInUpcoming = new Set<string>();

    upcomingMatches.forEach((m) => {
      teamsInUpcoming.add(m.teams.home.name.toLowerCase());
      teamsInUpcoming.add(m.teams.away.name.toLowerCase());
    });

    // Filtrar solo los favoritos que estén en la lista anterior
    return equiposFavoritos.filter((fav) =>
      teamsInUpcoming.has(fav.title.toLowerCase()),
    );
  }, [equiposFavoritos, upcomingMatches]);

  // 🧠 Filtrar partidos por texto y por equipo favorito seleccionado
  const filteredMatches = useMemo(() => {
    let results = upcomingMatches;

    // Filtrar por equipo favorito seleccionado
    if (selectedFavoriteTeam !== "ALL") {
      const favLower = selectedFavoriteTeam.toLowerCase();

      results = results.filter(
        (match) =>
          match.teams.home.name.toLowerCase() === favLower ||
          match.teams.away.name.toLowerCase() === favLower,
      );
    }

    // Filtro por texto del buscador
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      results = results.filter(
        (match) =>
          match.teams.home.name.toLowerCase().includes(query) ||
          match.teams.away.name.toLowerCase().includes(query),
      );
    }

    return results;
  }, [upcomingMatches, searchText, selectedFavoriteTeam]);

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
        placeholderTextColor={colors.textSecondary}
      />

      {/* Filtro por favoritos */}
      {favoriteTeamsInUpcoming.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsRowHorizontal, { marginTop: 4 }]}
        >
          <Chip
            selected={selectedFavoriteTeam === "ALL"}
            onPress={() => setSelectedFavoriteTeam("ALL")}
            style={[styles.chip, { backgroundColor: colors.surface }]}
            avatar={<Text style={{ fontSize: 16 }}>⭐</Text>}
          >
            Favoritos
          </Chip>

          {favoriteTeamsInUpcoming.map((eq) => (
            <Chip
              key={eq.id}
              selected={selectedFavoriteTeam === eq.title}
              onPress={() =>
                setSelectedFavoriteTeam((prev) =>
                  prev === eq.title ? "ALL" : eq.title,
                )
              }
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedFavoriteTeam === eq.title
                      ? colors.success
                      : colors.surface,
                },
              ]}
              avatar={
                <Image
                  source={{ uri: eq.img }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                  }}
                />
              }
            >
              {eq.title}
            </Chip>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: 20 }}>
        {groupedByRound.length === 0 ? (
          <Text style={styles.noResults}>No se encontraron resultados.</Text>
        ) : (
          groupedByRound.map(([round, matches], roundIndex) => (
            <View key={round}>
              {roundIndex > 0 && roundIndex % 2 === 0 && (
                <View style={{ marginVertical: 12 }}>
                  <AdBanner />
                </View>
              )}

              <Text style={styles.roundTitle}>{round}</Text>

              {matches.map((match, index) => {
                const isHome = match.teams.home.id.toString() == teamId;
                const matchDate = dayjs(match.date);
                const formattedDate = matchDate.format("DD MMM YYYY, HH:mm");
                const timeUntil = matchDate.fromNow();

                const bgColor = colors.surface;
                const borderColor = isHome ? colors.success : colors.info; // Verde si local, naranja si visitante
                const tagColor = borderColor;

                return (
                  <Card
                    key={index}
                    style={[
                      styles.card,
                      {
                        backgroundColor: bgColor,
                        borderLeftColor: borderColor,
                      },
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

                      <Text style={[styles.vs, { color: borderColor }]}>
                        VS
                      </Text>

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
    color: colors.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  noResults: {
    textAlign: "center",
    color: colors.textSecondary,
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
    color: colors.text,
  },
  vs: {
    fontWeight: "bold",
    fontSize: 16,
  },
  stadiumText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 4,
  },
  timeUntil: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  chip: { marginRight: 8, marginBottom: 8 },
  chipsRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
});
