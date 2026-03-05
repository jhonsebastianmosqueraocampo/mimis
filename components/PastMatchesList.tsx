import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { Fixture, swiperItem } from "@/types";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar, Card, Chip, Divider } from "react-native-paper";

type PastMatchesListProps = {
  previousMatches: Fixture[];
  actionMatch: (id: string) => void;
  teamId?: string;
  equiposFavoritos?: swiperItem[];
};

export default function PastMatchesList({
  previousMatches,
  teamId,
  actionMatch,
  equiposFavoritos,
}: PastMatchesListProps) {
  const [searchText, setSearchText] = useState("");

  const [selectedFavoriteTeam, setSelectedFavoriteTeam] = useState<
    string | "ALL"
  >("ALL");

  const favoriteTeamsInUpcoming = useMemo(() => {
    if (!equiposFavoritos || !previousMatches) return [];

    // Extraer los nombres de equipos que aparecen en los próximos partidos
    const teamsInUpcoming = new Set<string>();

    previousMatches.forEach((m) => {
      teamsInUpcoming.add(m.teams.home.name.toLowerCase());
      teamsInUpcoming.add(m.teams.away.name.toLowerCase());
    });

    // Filtrar solo los favoritos que estén en la lista anterior
    return equiposFavoritos.filter((fav) =>
      teamsInUpcoming.has(fav.title.toLowerCase()),
    );
  }, [equiposFavoritos, previousMatches]);

  // 🧠 Filtrar partidos por texto y por equipo favorito seleccionado
  const filteredMatches = useMemo(() => {
    let results = previousMatches;

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
  }, [previousMatches, searchText, selectedFavoriteTeam]);

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
            style={[styles.chip, { backgroundColor: "#FFFBEA" }]}
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
                    selectedFavoriteTeam === eq.title ? "#D6F5D6" : "#F0F0F0",
                },
              ]}
              avatar={
                <Image
                  source={{ uri: eq.img }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                  }}
                />
              }
            >
              {eq.title}
            </Chip>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={{ gap: 20 }}>
        {groupedByRound.length === 0 ? (
          <Text style={styles.noResults}>No se encontraron resultados.</Text>
        ) : (
          groupedByRound.map(([round, matches], roundIndex) => (
            <View key={round}>
              {/* Cada 2 rondas insertamos banner */}
              {roundIndex > 0 && roundIndex % 2 === 0 && (
                <View style={{ marginVertical: 12 }}>
                  <AdBanner />
                </View>
              )}

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
  container: {
    marginBottom: spacing.md,
  },

  title: {
    ...typography.title,
    fontWeight: "700",
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },

  roundTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs ?? 4,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },

  noResults: {
    ...typography.body,
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },

  scroll: {
    paddingRight: spacing.xs ?? 4,
  },

  card: {
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  date: {
    ...typography.small,
    fontWeight: "500",
    color: colors.textPrimary,
  },

  tag: {
    ...typography.small,
    color: colors.textSecondary,
  },

  divider: {
    marginVertical: spacing.xs,
  },

  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: spacing.xs,
  },

  teamBlock: {
    alignItems: "center",
    width: 80,
  },

  teamName: {
    marginTop: spacing.xs ?? 4,
    ...typography.small,
    textAlign: "center",
    color: colors.textPrimary,
  },

  result: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  stadiumRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs ?? 4,
    marginTop: spacing.xs ?? 4,
  },

  stadiumText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs ?? 4,
  },

  chip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },

  chipsRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.sm,
  },
});
