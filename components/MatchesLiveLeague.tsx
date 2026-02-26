import PrivateLayout from "@/app/privateLayout";
import { useFetch } from "@/hooks/FetchContext";
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
    map.set(m.fixtureId, { ...m, status: { ...m.status } })
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
      ])
    );

    return equiposFavoritos.filter((fav) =>
      teamsInMatches.has(fav.title.toLowerCase())
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
          match.teams.away.name.toLowerCase() === favLower
      );
    }

    // 🔍 Filtrar por texto
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      results = results.filter(
        (match) =>
          match.teams.home.name.toLowerCase().includes(q) ||
          match.teams.away.name.toLowerCase().includes(q)
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
          placeholderTextColor="#999"
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
                    prev === eq.title ? "ALL" : eq.title
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
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    padding: 14,
    elevation: 5,
    shadowColor: "#000",
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
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1.1,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  liveChip: {
    backgroundColor: "#1B5E20",
    marginTop: 6,
  },
  liveChipText: {
    color: "#fff",
    fontWeight: "600",
  },
  venueText: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginTop: 8,
  },
  logo: {
    backgroundColor: "transparent",
  },
  noResults: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
    fontSize: 16,
  },
  chip: { marginRight: 8, marginBottom: 8 },
  chipsRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
});
