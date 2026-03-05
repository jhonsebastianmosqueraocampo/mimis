import PrivateLayout from "@/app/privateLayout";
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { LiveMatch, RootStackParamList, swiperItem } from "@/types";
import { useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppState,
  AppStateStatus,
  Image,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Card, Chip } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type MatchesLiveLeagueProps = {
  leagueId: string;
  equiposFavoritos?: swiperItem[];
};

const mergeById = (oldArr: LiveMatch[], newArr: LiveMatch[]): LiveMatch[] => {
  const map = new Map<number, LiveMatch>();
  oldArr.forEach((m) => map.set(m.fixtureId, m));
  newArr.forEach((m) =>
    map.set(m.fixtureId, { ...m, status: { ...m.status } }),
  );
  return Array.from(map.values());
};

export default function MatchesLiveLeague({
  leagueId,
  equiposFavoritos,
}: MatchesLiveLeagueProps) {
  const { getMatchesTodayFromLeague } = useFetch();
  const [allMatches, setAllMatches] = useState<LiveMatch[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedFavoriteTeam, setSelectedFavoriteTeam] = useState<
    string | "ALL"
  >("ALL");

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatches = async () => {
    try {
      const { matches } = await getMatchesTodayFromLeague(leagueId);
      return matches;
    } catch (error) {
      return [];
    }
  };

  const favoriteTeamsInAllMatches = useMemo(() => {
    if (!equiposFavoritos || !allMatches) return [];

    const teamsInMatches = new Set(
      allMatches.flatMap((m) => [
        m.teams.home.name.toLowerCase(),
        m.teams.away.name.toLowerCase(),
      ]),
    );

    return equiposFavoritos.filter((fav) =>
      teamsInMatches.has(fav.title.toLowerCase()),
    );
  }, [equiposFavoritos, allMatches]);

  // 🔹 Inicia polling solo mientras la pantalla está activa
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      const fresh = await fetchMatches();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAllMatches((prev) => mergeById(prev, fresh));
    }, 60 * 1000);
  }, [fetchMatches]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const fresh = await fetchMatches();
      setAllMatches((prev) => mergeById(prev, fresh));
    })();

    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        startPolling();
      } else if (next.match(/inactive|background/)) {
        stopPolling();
      }
      appState.current = next;
    });

    startPolling();
    return () => {
      stopPolling();
      sub.remove();
    };
  }, [fetchMatches, startPolling, stopPolling]);

  const filteredMatches = useMemo(() => {
    let results = [...allMatches];

    // 🟢 Filtrar por favorito seleccionado
    if (selectedFavoriteTeam !== "ALL") {
      const favLower = selectedFavoriteTeam.toLowerCase();
      results = results.filter(
        (match) =>
          match.teams.home.name.toLowerCase() === favLower ||
          match.teams.away.name.toLowerCase() === favLower,
      );
    }

    // 🔍 Filtrar por texto
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      results = results.filter(
        (match) =>
          match.teams.home.name.toLowerCase().includes(q) ||
          match.teams.away.name.toLowerCase().includes(q),
      );
    }

    return results;
  }, [allMatches, selectedFavoriteTeam, searchText]);

  const actionMatch = (id: string) => {
    navigation.navigate("match", { id });
  };

  return (
    <PrivateLayout>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>⚡ Partidos en Vivo</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar equipo..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Filtro por favoritos */}
        {favoriteTeamsInAllMatches.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.chipsRowHorizontal,
              { marginTop: 4 },
            ]}
          >
            <Chip
              selected={selectedFavoriteTeam === "ALL"}
              onPress={() => setSelectedFavoriteTeam("ALL")}
              style={[styles.chip, { backgroundColor: "#FFFBEA" }]}
              avatar={<Text style={{ fontSize: 16 }}>⭐</Text>}
            >
              Favoritos
            </Chip>

            {favoriteTeamsInAllMatches.map((eq) => (
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
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                avatar={
                  <Image
                    source={{ uri: eq.img }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.background,
                    }}
                  />
                }
              >
                {eq.title}
              </Chip>
            ))}
          </ScrollView>
        )}

        <ScrollView
          style={{ marginTop: 10 }}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredMatches.length === 0 ? (
            <Text style={styles.noResults}>No hay partidos en vivo</Text>
          ) : (
            filteredMatches.map((match) => (
              <TouchableOpacity
                key={match.fixtureId}
                activeOpacity={0.9}
                onPress={() => actionMatch(match.fixtureId.toString())}
              >
                <Card style={styles.card}>
                  <View style={styles.row}>
                    <View style={styles.team}>
                      <Avatar.Image
                        size={42}
                        source={{ uri: match.teams.home.logo }}
                        style={styles.logo}
                      />
                      <Text numberOfLines={1} style={styles.teamName}>
                        {match.teams.home.name}
                      </Text>
                    </View>

                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>
                        {match.goals.home} - {match.goals.away}
                      </Text>
                      <Chip
                        icon="clock-outline"
                        compact
                        style={styles.liveChip}
                        textStyle={styles.liveChipText}
                      >
                        {match.status.elapsed}' {match.status.short}
                      </Chip>
                    </View>

                    <View style={styles.team}>
                      <Avatar.Image
                        size={42}
                        source={{ uri: match.teams.away.logo }}
                        style={styles.logo}
                      />
                      <Text numberOfLines={1} style={styles.teamName}>
                        {match.teams.away.name}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.venueText}>
                    {match.fixture.venue?.name}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },

  headerTitle: {
    ...typography.titleLarge,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    elevation: 5,
    shadowColor: shadows.lg.shadowColor,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  team: {
    alignItems: "center",
    flex: 1,
  },

  teamName: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1.1,
  },

  scoreText: {
    ...typography.titleLarge,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  liveChip: {
    backgroundColor: colors.success ?? colors.primary,
    marginTop: spacing.xs,
  },

  liveChipText: {
    ...typography.small,
    color: colors.textOnPrimary,
    fontWeight: "600",
  },

  venueText: {
    ...typography.title,
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  logo: {
    backgroundColor: "transparent",
  },

  noResults: {
    ...typography.body,
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xl,
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
