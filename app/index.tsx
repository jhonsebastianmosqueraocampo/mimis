import { useFetch } from "@/hooks/FetchContext";
import { LiveMatch, RootStackParamList } from "@/types";
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
  Dimensions,
  Image,
  LayoutAnimation,
  Modal,
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

// Habilitar animaciones en Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ------- HELPERS -------
const LIVE_STATUSES = ["1H", "2H", "ET", "HT", "LIVE"];
const FINISHED_STATUSES = ["FT", "AET", "PEN", "CANC", "ABD", "WO"];

const sectionize = (matches: LiveMatch[]) => {
  const now = Date.now();

  const upcoming: LiveMatch[] = [];
  const live: LiveMatch[] = [];
  const finished: LiveMatch[] = [];

  for (const m of matches) {
    const fixtureTime = new Date(m.fixture.date).getTime();

    if (fixtureTime > now) {
      // Todavía no arranca → próximo
      upcoming.push(m);
    } else {
      // Ya arrancó → puede estar en vivo o finalizado
      if (LIVE_STATUSES.includes(m.status.short)) {
        live.push(m);
      } else {
        finished.push(m);
      }
    }
  }

  // Ordenamos cada grupo
  upcoming.sort(
    (a, b) =>
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
  live.sort(
    (a, b) =>
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
  finished.sort(
    (a, b) =>
      new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
  );

  // Construimos secciones
  const sections: Array<{ title: string; data: LiveMatch[] }> = [];
  if (live.length) sections.push({ title: "EN VIVO", data: live });
  if (upcoming.length) sections.push({ title: "PRÓXIMOS", data: upcoming });
  if (finished.length) sections.push({ title: "FINALIZADOS", data: finished });
  return sections;
};

const mergeById = (oldArr: LiveMatch[], newArr: LiveMatch[]): LiveMatch[] => {
  const map = new Map<number, LiveMatch>();

  oldArr.forEach((m) => {
    map.set(m.fixtureId, m);
  });

  newArr.forEach((m) => {
    // clona para que React lo vea como "nuevo objeto"
    map.set(m.fixtureId, { ...m, status: { ...m.status } });
  });

  return Array.from(map.values());
};

// ------- SCREEN -------
export default function home() {
  const { getMatchesToday } = useFetch();
  const [allMatches, setAllMatches] = useState<LiveMatch[]>([]);
  const [query, setQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<number | "ALL">("ALL");
  const [selectedLeagueName, setSelectedLeagueName] = useState<string>("Todas");
  const [events, setEvents] = useState<string[]>();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const [selectedSection, setSelectedSection] = useState<
    "ALL" | "LIVE" | "NS" | "FT"
  >("ALL");
  const [leagueSearch, setLeagueSearch] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { success, matches } = await getMatchesToday();

        if (success) {
          setAllMatches(matches);
        }
      } catch (err) {
        console.error("Error cargando partidos:", err);
      }
    };

    fetchData();
  }, []);

  const fetchMatches = async () => {
    try {
      const { matches } = await getMatchesToday();
      return matches;
    } catch (error) {
      return []; // fallback seguro
    }
  };

  // 🔹 inicia el polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      const fresh = await fetchMatches();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAllMatches((prev) => mergeById(prev, fresh));
    }, 60 * 1000); // cada 60s
  }, [fetchMatches]);

  // 🔹 detiene el polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const enrichedEvents = buildEventMessages(allMatches);
    setEvents(enrichedEvents);
  }, [allMatches]);

  const eventsKey = useMemo(() => JSON.stringify(events), [events]);

  // 🔹 rotación del ticker
  useEffect(() => {
    if (!events || events.length === 0) return;

    const ticker = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(ticker);
  }, [eventsKey]);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMatches.filter((m) => {
      const byLeague =
        selectedLeague === "ALL" ? true : m.league.id === selectedLeague;
      if (!byLeague) return false;

      if (!q) return true;
      return (
        m.teams.home.name.toLowerCase().includes(q) ||
        m.teams.away.name.toLowerCase().includes(q)
      );
    });
  }, [allMatches, query, selectedLeague]);

  const { height, width } = Dimensions.get("window");

  const sections = useMemo(() => {
    const allSections = sectionize(filtered);
    if (selectedSection === "ALL") return allSections;
    return allSections.filter((s) => {
      if (selectedSection === "LIVE") return s.title === "EN VIVO";
      if (selectedSection === "NS") return s.title === "PRÓXIMOS";
      if (selectedSection === "FT") return s.title === "FINALIZADOS";
      return true;
    });
  }, [filtered, selectedSection]);

  const leagues = useMemo(() => {
    const map = new Map<number, { id: number; name: string; logo: string }>();
    allMatches.forEach((m) => {
      if (!map.has(m.league.id)) {
        map.set(m.league.id, {
          id: m.league.id,
          name: m.league.name,
          logo: m.league.logo,
        });
      }
    });
    return Array.from(map.values());
  }, [allMatches]);

  const filteredLeagues = useMemo(() => {
    if (!leagueSearch.trim()) return leagues;
    return leagues.filter((lg) =>
      lg.name.toLowerCase().includes(leagueSearch.trim().toLowerCase())
    );
  }, [leagueSearch, leagues]);

  const buildEventMessages = (matches: LiveMatch[]) => {
    const messages: string[] = [];

    for (const m of matches) {
      const home = m.teams.home.name;
      const away = m.teams.away.name;

      // 📢 Inicio
      if (m.status.short === "1H" && m.status.elapsed === 1) {
        messages.push(`🔔 ¡Arranca ${home} vs ${away}!`);
      }

      // ⚽ Eventos del partido
      for (const ev of m.events) {
        if (ev.type === "Goal") {
          const minute = `${ev.time.elapsed}${
            ev.time.extra ? "+" + ev.time.extra : ""
          }'`;
          const player = ev.player?.name ?? "Jugador";
          const assist = ev.assist?.name ? ` (asist: ${ev.assist.name})` : "";
          messages.push(
            `⚽ ${minute} Gol de ${player}${assist} (${home} vs ${away})`
          );
        }
        if (ev.type === "Card" && ev.detail === "Red Card") {
          const minute = `${ev.time.elapsed}'`;
          const player = ev.player?.name ?? "Jugador";
          messages.push(
            `🟥 ${minute} Roja para ${player} (${home} vs ${away})`
          );
        }
      }

      // ⏸️ Descanso
      if (m.status.short === "HT") {
        messages.push(`⏸️ Descanso en ${home} vs ${away}`);
      }

      // 🔚 Final
      if (FINISHED_STATUSES.includes(m.status.short)) {
        messages.push(
          `🔚 Final: ${home} ${m.goals.home} - ${m.goals.away} ${away}`
        );
      }

      // 📊 Resúmenes si no hay eventos
      if (m.events.length <= 1) {
        if (LIVE_STATUSES.includes(m.status.short)) {
          messages.push(
            `📊 En vivo: ${home} ${m.goals.home} - ${m.goals.away} ${away} (${
              m.status.elapsed ?? 0
            }’)`
          );
        }
        if (FINISHED_STATUSES.includes(m.status.short)) {
          messages.push(
            `📊 Resultado final: ${home} ${m.goals.home} - ${m.goals.away} ${away}`
          );
        }
      }
    }

    return messages;
  };

  const actionLeague = (name: string) => {
    const league = leagues.filter(
      (league) => league.name.toLowerCase() === name.toLowerCase()
    )[0];
    const id = league.id.toString();
    navigation.navigate("tournament", { id });
  };

  const actionVideos = () => {
    navigation.navigate("weekResumeVideos");
  };

  return (
    <PrivateLayout>
      <View style={styles.container}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <View style={{ marginBottom: 8 }}>
            {/* 🔍 Buscador de ligas */}
            <Searchbar
              placeholder="Buscar liga..."
              value={leagueSearch}
              onChangeText={setLeagueSearch}
              style={styles.search}
            />

            {/* Chips horizontales */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRowHorizontal}
            >
              <Chip
                selected={selectedLeague === "ALL"}
                onPress={() => setSelectedLeague("ALL")}
                style={styles.chip}
              >
                Todas
              </Chip>

              {filteredLeagues.map((lg) => (
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
          <Searchbar
            placeholder="Buscar equipo..."
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
        </View>

        {/* Botón Ver Resúmenes */}
        <Button
          mode="contained"
          onPress={() => actionVideos()}
          style={{ margin: 16, backgroundColor: PRIMARY }}
        >
          Ver Resúmenes
        </Button>

        {events && events.length > 0 && (
          <View style={styles.eventTicker}>
            <Text style={styles.eventText}>{events[currentEventIndex]}</Text>
          </View>
        )}

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
            selected={selectedSection === "FT"}
            onPress={() => setSelectedSection("FT")}
            style={styles.chip}
          >
            Finalizados
          </Chip>
        </View>

        {selectedLeague !== "ALL" && (
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

        {/* Listado */}
        <View style={{ paddingBottom: 24 }}>
          {sections.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ color: "#666" }}>
                No hay partidos en vivo o en los próximos 45’.
              </Text>
            </View>
          ) : (
            sections.map((section, sIdx) => (
              <View key={`${section.title}-${sIdx}`}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                {section.data.map((item) => (
                  <MatchRow
                    key={item.fixtureId} // más confiable que _id
                    match={item}
                  />
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
const MatchRow = React.memo(
  ({
    match
  }: {
    match: LiveMatch
  }) => {
    const [showName, setShowName] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const isLive = LIVE_STATUSES.includes(match.status.short);
    const isFinished = FINISHED_STATUSES.includes(match.status.short);

    let winnerHome = false;
    let winnerAway = false;

    if (isFinished) {
      const homeGoals = match.goals.home ?? 0;
      const awayGoals = match.goals.away ?? 0;

      if (homeGoals > awayGoals) winnerHome = true;
      if (awayGoals > homeGoals) winnerAway = true;
      // si son iguales → empate, ambos en false
    }

    const formatKickoff = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const actionMatch = (id: string) => {
      navigation.navigate("match", { id });
    };

    return (
      <>
        <TouchableOpacity
          onPress={() => actionMatch(match.fixtureId.toString())}
        >
          <View style={styles.matchCard}>
            {/* --- Primera fila: equipos y marcador --- */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Local */}
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

              {/* Centro marcador */}
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

              {/* Visitante */}
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

            {/* --- Segunda fila: acciones --- */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => setShowStats(true)}
                style={styles.actionBtn}
              >
                <Text style={{ fontSize: 14 }}>ℹ️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  console.log("⭐ Partido favorito:", match.fixtureId)
                }
                style={styles.actionBtn}
              >
                <Text style={{ fontSize: 16 }}>⭐</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Modal nombre completo */}
        <Modal visible={!!showName} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowName(null)}
          >
            <View style={styles.modalBox}>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                {showName}
              </Text>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal estadísticas rápidas */}
        <Modal visible={showStats} transparent animationType="slide">
          <View style={styles.statsModal}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Estadísticas rápidas
            </Text>
            {match.statistics.length > 0 ? (
              match.statistics[0]?.statistics.slice(0, 3).map((stat, idx) => (
                <Text key={`home-stat-${idx}`} style={{ marginBottom: 6 }}>
                  {stat.type}: {stat.value ?? "-"}
                </Text>
              ))
            ) : (
              <Text>No hay estadísticas aún</Text>
            )}
            <Button
              onPress={() => setShowStats(false)}
              style={{ marginTop: 12 }}
            >
              Cerrar
            </Button>
          </View>
        </Modal>
      </>
    );
  }
);

// ------- STYLES -------
const PRIMARY = "#1DB954";

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

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ddd",
    marginLeft: 60,
  },
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

  // Barra LIVE
  barContainer: {
    marginTop: 4,
    width: 40,
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    overflow: "hidden",
  },
  liveBar: {
    width: 20,
    height: 4,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },

  // Video highlight LIVE
  videoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 8,
  },
  videoText: { fontSize: 12, color: PRIMARY, marginLeft: 4 },

  // Video UPCOMING
  upcomingVideoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 60,
    paddingVertical: 4,
  },

  empty: { alignItems: "center", marginTop: 24 },

  // Videos estilo TikTok
  webview: { flex: 1 },
  videoOverlay: {
    position: "absolute",
    bottom: 60,
    left: 16,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  eventTicker: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eventText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D32F2F",
  },
  leagueChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 8,
  },
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
  leagueSearch: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    fontSize: 14,
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
  modalBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
  },
  infoBox: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
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
  actionBtn: {
    padding: 4,
  },
});
