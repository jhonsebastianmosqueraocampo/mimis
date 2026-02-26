import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import {
  LeagueItem,
  LiveMatch,
  RootStackParamList,
  Section,
  swiperItem,
} from "@/types";
import { useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Image,
  LayoutAnimation,
  Linking,
  Modal,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Chip, Searchbar } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

async function ensureOverlayPermission() {
  if (Platform.OS !== "android") return true;

  try {
    const granted = await NativeModules.FloatingModule.hasOverlayPermission();
    if (granted) return true;

    // No está concedido → abrimos ajustes
    await Linking.openSettings();
    return false;
  } catch {
    return false;
  }
}

const pickStat = (stats: any[], type: string) =>
  stats.find((s) => s.type === type)?.value ?? "-";

const getGoalsByTeam = (events: any[], teamId: number) =>
  events
    .filter((e) => e.type === "Goal" && e.team?.id === teamId)
    .map((e) => ({
      minute: e.time?.elapsed,
      player: e.player?.name,
      detail: e.detail, // Penalty, Own Goal, etc.
    }));

const { FloatingModule } = NativeModules;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIMARY = "#1DB954";

export default function home() {
  const { getMatchesToday, getFavorites } = useFetch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // data desde back
  const [sections, setSections] = useState<Section[]>([]);
  const [leagues, setLeagues] = useState<LeagueItem[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // filtros UI
  const [selectedLeague, setSelectedLeague] = useState<number>(0);
  const [selectedLeagueName, setSelectedLeagueName] = useState<string>("Todas");
  const [selectedSection, setSelectedSection] = useState<
    "ALL" | "LIVE" | "NS" | "FINISHED" | "CANCELLED" | "POSTPONED"
  >("ALL");

  const [query, setQuery] = useState(""); // buscar equipo
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // favoritos
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [selectedFavoriteTeam, setSelectedFavoriteTeam] = useState<
    string | "ALL"
  >("ALL");

  // estados buscador (cuando no juega)
  const [teamPlaysToday, setTeamPlaysToday] = useState<boolean | undefined>(
    undefined,
  );
  const [teamInfo, setTeamInfo] = useState<
    { id?: number; name: string; logo?: string } | undefined
  >(undefined);
  const [teamMessage, setTeamMessage] = useState<string | undefined>(undefined);

  // loading
  const [loading, setLoading] = useState(true);

  // polling
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- debounce para query de equipo ---
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    loadRewardedAd();
  }, []);

  const effectiveLeagueId = useMemo(() => {
    // si el usuario no seleccionó liga, le mandamos ALL para que el back use su defaultLeagueId
    return selectedLeague;
  }, [selectedLeague]);

  const effectiveTeam = useMemo(() => {
    // Prioridad: lo que escriba el usuario
    if (debouncedQuery.length > 0) return debouncedQuery;

    // si no está escribiendo, puede filtrar por favorito
    if (selectedFavoriteTeam !== "ALL") return selectedFavoriteTeam;

    return "";
  }, [debouncedQuery, selectedFavoriteTeam]);

  const fetchData = useCallback(async () => {
    const { success, leagues, sections, teamPlaysToday, teamInfo, message } =
      await getMatchesToday({
        leagueId: effectiveLeagueId,
        team: effectiveTeam || undefined,
        status: selectedSection,
      });

    if (!success) return;

    // ✅ UI smooth
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setLeagues(leagues || []);
    setSections(sections || []);
    setEvents(events || []);

    setTeamPlaysToday(teamPlaysToday);
    setTeamInfo(teamInfo);
    setTeamMessage(message);
  }, [getMatchesToday, effectiveLeagueId, effectiveTeam, selectedSection]);

  // cargar favoritos una vez
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const { success, teams } = await getFavorites();
        if (!isMounted) return;
        if (success) setEquipos(teams);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [getFavorites]);

  // primer fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ticker rotación
  const eventsKey = useMemo(() => JSON.stringify(events), [events]);
  useEffect(() => {
    if (!events || events.length === 0) return;
    const ticker = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(ticker);
  }, [eventsKey]);

  // polling (solo fetch) cada 60s
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 60 * 1000);
  }, [fetchData]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        startPolling();
        fetchData();
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
  }, [startPolling, stopPolling, fetchData]);

  const actionVideos = () => navigation.navigate("worldTop10Screen");

  const actionLeague = (name: string) => {
    const league = leagues.find(
      (l) => l.name.toLowerCase() === name.toLowerCase(),
    );
    if (!league) return;
    navigation.navigate("tournament", { id: String(league.id) });
  };

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <PrivateLayout>
      <View style={styles.container}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <View style={{ marginBottom: 8 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRowHorizontal}
            >
              <Chip
                selected={selectedLeague === 0}
                onPress={() => {
                  setSelectedLeague(0);
                  setSelectedLeagueName("Todas");
                }}
                style={styles.chip}
              >
                Todas
              </Chip>

              {leagues.map((lg) => (
                <Chip
                  key={lg.id}
                  selected={selectedLeague === lg.id}
                  onPress={() => {
                    setSelectedLeague(lg.id);
                    setSelectedLeagueName(lg.name);
                  }}
                  style={styles.leagueChip}
                >
                  {lg.name}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* ✅ Buscar equipo -> se manda al back (debounced) */}
          <Searchbar
            placeholder="Buscar equipo..."
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
        </View>

        <Button
          mode="contained"
          onPress={() => {
            showRewardedAd(() => {
              Alert.alert("Video visto 🎉", "Simulación de puntos +5");
            });
          }}
        >
          Probar Video Recompensado
        </Button>

        {/* Favoritos */}
        {equipos.length > 0 && (
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

            {equipos.map((eq) => (
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

        <Button
          mode="contained"
          onPress={actionVideos}
          style={{ margin: 16, backgroundColor: PRIMARY }}
        >
          Ver Resúmenes
        </Button>

        {/* ✅ Mensaje cuando se buscó equipo y NO juega hoy */}
        {debouncedQuery.length > 0 && teamPlaysToday === false && (
          <View style={styles.notPlayingBox}>
            <Text style={styles.notPlayingText}>
              {teamMessage || "Ese equipo no juega hoy."}
            </Text>
          </View>
        )}

        {/* ticker desde back */}
        {events && events.length > 0 && (
          <View style={styles.eventTicker}>
            <Text style={styles.eventText}>{events[currentEventIndex]}</Text>
          </View>
        )}

        {/* filtros de status */}
        <View style={styles.chipsRow}>
          <Chip
            selected={selectedSection === "ALL"}
            onPress={() => setSelectedSection("ALL")}
            style={styles.chip}
          >
            Todos
          </Chip>
          <Chip
            selected={selectedSection === "LIVE"}
            onPress={() => setSelectedSection("LIVE")}
            style={styles.chip}
          >
            En Vivo
          </Chip>
          <Chip
            selected={selectedSection === "NS"}
            onPress={() => setSelectedSection("NS")}
            style={styles.chip}
          >
            Próximos
          </Chip>
          <Chip
            selected={selectedSection === "FINISHED"}
            onPress={() => setSelectedSection("FINISHED")}
            style={styles.chip}
          >
            Finalizados
          </Chip>
        </View>

        {selectedLeague !== 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
            <Button
              mode="contained-tonal"
              style={styles.leagueButton}
              labelStyle={{ fontWeight: "700" }}
              onPress={() => actionLeague(selectedLeagueName)}
            >
              Ver {selectedLeagueName}
            </Button>
          </View>
        )}

        {/*Banner superior */}
        <View style={{ marginVertical: 10, alignItems: "center" }}>
          <AdBanner />
        </View>

        {/* Listado por sections (ya viene del back) */}
        <View style={{ paddingBottom: 24 }}>
          {sections.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ color: "#666" }}>
                No hay partidos para mostrar.
              </Text>
            </View>
          ) : (
            sections.map((section, sIdx) => (
              <View key={`${section.title}-${sIdx}`}>
                {/* Cada 2 secciones insertamos banner */}
                {sIdx > 0 && sIdx % 2 === 0 && <AdBanner />}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                {section.data.map((item) => (
                  <MatchRow key={item.fixtureId} match={item} />
                ))}
              </View>
            ))
          )}
        </View>
      </View>
    </PrivateLayout>
  );
}

// ------- ROW -------
const MatchRow = React.memo(({ match }: { match: LiveMatch }) => {
  const [showName, setShowName] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isLive = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(
    match.status.short,
  );
  const isFinished = ["FT", "AET", "PEN", "AWD", "WO"].includes(
    match.status.short,
  );

  let winnerHome = false;
  let winnerAway = false;

  if (isFinished) {
    const homeGoals = match.goals.home ?? 0;
    const awayGoals = match.goals.away ?? 0;
    if (homeGoals > awayGoals) winnerHome = true;
    if (awayGoals > homeGoals) winnerAway = true;
  }

  const formatKickoff = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const actionMatch = (id: string) => navigation.navigate("match", { id });

  return (
    <>
      <TouchableOpacity onPress={() => actionMatch(match.fixtureId.toString())}>
        <View style={styles.matchCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.team}>
              <Image
                source={{ uri: match.teams.home.logo }}
                style={styles.logo}
              />
              <Text
                style={[
                  styles.teamName,
                  winnerHome && { color: PRIMARY, fontWeight: "700" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
                onPress={() => setShowName(match.teams.home.name)}
              >
                {match.teams.home.name}
              </Text>
            </View>

            <View style={styles.center}>
              {isLive ? (
                <>
                  <Text style={styles.scoreText}>
                    {match.goals.home} - {match.goals.away}
                  </Text>
                  <View style={styles.liveRow}>
                    <View style={styles.liveDot} />
                    <Text style={styles.minute}>
                      {match.status.short === "HT"
                        ? "Descanso"
                        : `${match.status.elapsed}’`}
                    </Text>
                  </View>
                </>
              ) : match.status.short === "NS" ? (
                <>
                  <Text style={styles.startText}>Inicia</Text>
                  <Text style={styles.minute}>
                    {formatKickoff(match.fixture.date)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.scoreText}>
                    {match.goals.home} - {match.goals.away}
                  </Text>
                  <Text style={styles.startText}>Final</Text>
                </>
              )}
            </View>

            <View style={styles.teamRight}>
              <Text
                style={[
                  styles.teamName,
                  winnerAway && { color: PRIMARY, fontWeight: "700" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
                onPress={() => setShowName(match.teams.away.name)}
              >
                {match.teams.away.name}
              </Text>
              <Image
                source={{ uri: match.teams.away.logo }}
                style={styles.logo}
              />
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => setShowStats(true)}
              style={styles.actionBtn}
            >
              <Text style={{ fontSize: 14 }}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <Modal visible={!!showName} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowName(null)}
        >
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>{showName}</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showStats} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalCard}>
            {/* HEADER */}
            <View style={styles.statsHeader}>
              <View style={styles.statsTeam}>
                <Image
                  source={{ uri: match.teams.home.logo }}
                  style={styles.statsLogo}
                />
                <Text style={styles.statsTeamName} numberOfLines={1}>
                  {match.teams.home.name}
                </Text>
              </View>

              <View style={styles.statsScore}>
                <Text style={styles.statsScoreText}>
                  {match.goals.home} - {match.goals.away}
                </Text>
                <Text style={styles.statsStatus}>
                  {match.status.short === "NS"
                    ? "No iniciado"
                    : match.status.short === "HT"
                      ? "Descanso"
                      : match.status.elapsed
                        ? `${match.status.elapsed}’`
                        : "Final"}
                </Text>
              </View>

              <View style={styles.statsTeam}>
                <Image
                  source={{ uri: match.teams.away.logo }}
                  style={styles.statsLogo}
                />
                <Text style={styles.statsTeamName} numberOfLines={1}>
                  {match.teams.away.name}
                </Text>
              </View>
            </View>

            {/* 🔥 GOLEADORES */}
            {(match.events?.length ?? 0) > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>⚽ Goles</Text>

                <View style={styles.goalsRow}>
                  <View style={{ width: "45%" }}>
                    {getGoalsByTeam(match.events, match.teams.home.id).map(
                      (g, i) => (
                        <Text key={`hg-${i}`} style={styles.goalItem}>
                          {g.minute}’ {g.player}
                          {g.detail === "Penalty" && " (P)"}
                        </Text>
                      ),
                    )}
                  </View>

                  <View style={{ width: "10%", alignItems: "center" }}>
                    <Text> </Text>
                  </View>

                  <View style={{ width: "45%" }}>
                    {getGoalsByTeam(match.events, match.teams.away.id).map(
                      (g, i) => (
                        <Text
                          key={`ag-${i}`}
                          style={[styles.goalItem, { textAlign: "right" }]}
                        >
                          {g.minute}’ {g.player}
                          {g.detail === "Penalty" && " (P)"}
                        </Text>
                      ),
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* 📊 ESTADÍSTICAS */}
            {match.statistics.length > 0 ? (
              <View style={styles.statsGrid}>
                {[
                  "Ball Possession",
                  "Total Shots",
                  "Shots on Goal",
                  "Corner Kicks",
                  "Fouls",
                  "Yellow Cards",
                ].map((label) => {
                  const homeStats = match.statistics[0]?.statistics || [];
                  const awayStats = match.statistics[1]?.statistics || [];

                  return (
                    <View key={label} style={styles.statsRow}>
                      <Text style={styles.statsValue}>
                        {pickStat(homeStats, label)}
                      </Text>
                      <Text style={styles.statsLabel}>{label}</Text>
                      <Text style={styles.statsValue}>
                        {pickStat(awayStats, label)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={{ textAlign: "center", marginVertical: 12 }}>
                No hay estadísticas aún
              </Text>
            )}

            {/* ACTIONS */}
            <View style={styles.statsActions}>
              <Button
                mode="contained"
                onPress={() =>
                  navigation.navigate("match", {
                    id: match.fixtureId.toString(),
                  })
                }
                style={{ flex: 1, marginRight: 8 }}
              >
                Ver partido
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowStats(false)}
                style={{ flex: 1 }}
              >
                Cerrar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
});

// ------- STYLES -------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  toolbar: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  search: { marginBottom: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: { marginRight: 8, marginBottom: 8 },

  sectionHeader: {
    backgroundColor: "#F9F9F9",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: { fontWeight: "700", color: "#222", fontSize: 13 },

  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
    marginHorizontal: 6,
  },
  scoreText: { fontSize: 16, fontWeight: "700", color: "#111" },
  startText: { fontSize: 14, fontWeight: "600", color: "#888" },
  minute: { fontSize: 12, color: PRIMARY, fontWeight: "700", marginTop: 2 },

  empty: { alignItems: "center", marginTop: 24 },

  eventTicker: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eventText: { fontSize: 14, fontWeight: "600", color: "#D32F2F" },

  notPlayingBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#F5C2C2",
  },
  notPlayingText: { fontSize: 14, fontWeight: "700", color: "#B00020" },

  leagueChip: {
    marginHorizontal: 6,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  leagueButton: {
    borderRadius: 10,
    paddingVertical: 4,
    backgroundColor: PRIMARY,
    color: "#F0F0F0",
  },
  chipsRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  liveRow: { flexDirection: "row", alignItems: "center" },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { backgroundColor: "#fff", padding: 16, borderRadius: 10 },
  statsModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 24,
    borderRadius: 12,
    padding: 20,
  },
  matchCard: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
  team: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 90 },
  teamRight: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    minWidth: 90,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    flexShrink: 1,
    maxWidth: 90,
  },
  center: { minWidth: 80, alignItems: "center" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
    gap: 12,
  },
  actionBtn: { padding: 4 },
  followBtn: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  statsModalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  statsTeam: {
    alignItems: "center",
    width: "30%",
  },

  statsLogo: {
    width: 36,
    height: 36,
    marginBottom: 4,
  },

  statsTeamName: {
    fontSize: 11,
    textAlign: "center",
  },

  statsScore: {
    alignItems: "center",
    width: "40%",
  },

  statsScoreText: {
    fontSize: 22,
    fontWeight: "700",
  },

  statsStatus: {
    fontSize: 12,
    color: "#666",
  },

  statsGrid: {
    marginVertical: 8,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  statsLabel: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    width: "40%",
  },

  statsValue: {
    fontSize: 13,
    fontWeight: "600",
    width: "30%",
    textAlign: "center",
  },

  statsActions: {
    flexDirection: "row",
    marginTop: 16,
  },

  goalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  goalItem: {
    fontSize: 12,
    marginBottom: 4,
  },
});
